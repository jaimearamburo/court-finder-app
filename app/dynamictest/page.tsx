import { Suspense } from 'react';
import DynamicSection from '@/app/components/DynamicSection';

export default function Page() {
  return (
    <>
      <div>Static content</div>
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicSection />
      </Suspense>
    </>
  );
}