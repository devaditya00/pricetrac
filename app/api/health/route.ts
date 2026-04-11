import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { timeStamp } from 'console'

export async function GET() {
    const supabase =await createClient()

    const { data, error } = await supabase
    .from('products')
    .select('id')
    .limit(1)

    if(error) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500})
    }

    return NextResponse.json({
        status: 'ok',
        app: 'PriceTrac',
        database: 'connected',
        timestamp: new Date().toISOString()
    })
}
