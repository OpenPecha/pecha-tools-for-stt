import prisma from "@/service/db";
import { NextResponse } from "next/server";

import { mapping } from "/data/mapping";

export async function GET(request, { params }) {

    if (mapping.has(params.email)) {
        return NextResponse.json(
            mapping.get(params.email)
        );
    }
    else {

        var user = await prisma.User.findUnique({
            where: {
                email: params.email,
            },
        });
        if (user === null) {
            return NextResponse.json({ error: 'No such email' }, { status: 404 })
        }

        user.url = `https://stt.pecha.tools/?session=${user.name}`;
        user.department = 'stt';

        // List of properties to delete
        const propertiesToDelete = ['id', 'name', 'email', 'group_id', 'role'];

        // Delete each property in the list
        propertiesToDelete.forEach(property => {
            if (user.hasOwnProperty(property)) {
                delete user[property];
            }
        });

        return NextResponse.json(user);
    }
}
