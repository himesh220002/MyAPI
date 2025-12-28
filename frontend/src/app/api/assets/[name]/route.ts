import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const { searchParams } = new URL(request.url);
        const filterId = searchParams.get("id");

        const { data, error } = await supabase
            .from("assets")
            .select("*")
            .eq("name", name)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        // Deep Filter logic: If 'id' query param exists and data is an array
        if (filterId && Array.isArray(data.data)) {
            const filteredItem = data.data.find((item: any) =>
                item.id === filterId || item.name?.toLowerCase() === filterId.toLowerCase()
            );

            if (!filteredItem) {
                return NextResponse.json({ error: `Item with id/name '${filterId}' not found in ${name}` }, { status: 404 });
            }

            return NextResponse.json(filteredItem);
        }

        // Directly return the asset data for easier consumption
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
