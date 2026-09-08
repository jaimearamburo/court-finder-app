// import { cookies } from 'next/headers';

// export default async function DynamicSection() {
//   const cookieStore = await cookies(); // ✅ Await it in async component
//   const userSession = cookieStore.get('session');

//   return <div>Hello {userSession?.value ?? 'Guest'}</div>;
// }

export const dynamic = 'force-dynamic';

export default async function DynamicSection() {
  return <div>Hello there from dynamic section!</div>;
}
