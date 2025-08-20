import { NextRequest, NextResponse } from 'next/server';

// JWT cookie name
const JWT_COOKIE = 'authToken';

// Logout processing
export async function POST(request: NextRequest) {
  try {
    // Redirect to top page
    const response = NextResponse.redirect(
      new URL('/?logged-out=1', process.env.BASE_URL)
    );

    // Delete cookies
    response.cookies.delete({
      name: JWT_COOKIE,
      path: '/', // Match the path set during login
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ message: 'A server error occurred.' }, { status: 500 });
  }
}