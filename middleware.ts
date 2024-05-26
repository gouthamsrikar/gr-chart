import { NextRequest, NextResponse } from "next/server";

import { withAuth } from 'next-auth/middleware';

export default withAuth({
    pages: {
        signIn: '/login',
    },
});

export const config = { matcher: ['/chart'] };



// export default function middleware(req: NextRequest) {
//     let verify = true// req.cookies.get("loggedin");
//     let url = req.url

//     if (!verify && url.includes('/dashboard')) {
//         return NextResponse.redirect("http://localhost:3000/");
//     }

//     if (verify && url === "http://localhost:3000/") {
//         return NextResponse.redirect("http://localhost:3000/dashboard");
//     }
// }