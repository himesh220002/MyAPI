import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { calculateNewPrice } from "@/lib/priceEngine";

export async function GET(request: Request) {
    // Security check: Only allow Vercel Cron or manual authorized requests
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    try {
        if (!supabase) {
            return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
        }

        // 1. Fetch all assets
        const { data: assets, error: fetchError } = await supabase
            .from("assets")
            .select("*");

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        const updates = [];

        const typeMapping: Record<string, string> = {
            "cryptoPrices": "crypto",
            "forexPrices": "currency",
            "mineralPrices": "mineral",
            "commodityPrices": "mineral",
            "fundPrices": "trade",
            "tradePrices": "trade"
        };

        for (const asset of assets) {
            let assetData = asset.data || {};
            const assetType = typeMapping[asset.name] || assetData.type || "crypto";

            // Helper to recursively update prices in the data blob
            const processData = (data: any): any => {
                if (!data || typeof data !== 'object' || data === null) return data;

                // Handle Arrays
                if (Array.isArray(data)) {
                    return data.map(item => processData(item));
                }

                const newData: any = { ...data };
                let hasSubAssets = false;

                // Always recurse into children first
                for (const key in data) {
                    // Skip market/history as they are metadata for the current level
                    if (key === 'market' || key === 'history') continue;

                    if (typeof data[key] === 'object' && data[key] !== null) {
                        const updated = processData(data[key]);
                        if (updated !== data[key]) {
                            newData[key] = updated;
                            hasSubAssets = true;
                        }
                    }
                }

                // If this object is a leaf asset (has price and identifier), and we haven't already updated children
                // Or if it's a legitimate asset that just happens to be a leaf.
                const isLeaf = typeof data.price === 'number' && (data.id || data.symbol || data.name);

                if (isLeaf && !hasSubAssets) {
                    // 10% chance to shift trend
                    if (Math.random() < 0.1) {
                        if (!newData.market) newData.market = {};
                        newData.market.trend = ['bullish', 'bearish', 'sideways'][Math.floor(Math.random() * 3)];
                    }

                    const result = calculateNewPrice(data, assetType);
                    return {
                        ...newData,
                        price: result.price,
                        change: result.change,
                        history: result.history,
                        lastUpdated: new Date().toISOString()
                    };
                }

                // Cleanup legacy root fields if this is a container that updated sub-assets
                if (hasSubAssets && typeof newData.price === 'number' && !newData.id && !newData.symbol) {
                    delete newData.price;
                    delete newData.change;
                    delete newData.history;
                    delete newData.lastUpdated;
                }

                return newData;
            };

            const updatedData = processData(assetData);

            // Save back to Supabase
            const { error: updateError } = await supabase
                .from("assets")
                .update({ data: updatedData })
                .eq("id", asset.id);

            if (updateError) {
                console.error(`Error updating asset ${asset.id}:`, updateError.message);
                updates.push({
                    name: asset.name,
                    id: asset.id,
                    status: "error",
                    message: updateError.message
                });
            } else {
                updates.push({
                    name: asset.name,
                    id: asset.id,
                    status: "success",
                    message: "Collection or Asset updated successfully"
                });
            }
        }

        return NextResponse.json({
            message: "Price update completed",
            total: assets.length,
            updates
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
