'use client';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useRouter } from 'next/navigation';

export default function Pager({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <Stack alignItems="center" sx={{ mt: 3 }}>
      <Pagination
        count={totalPages}
        page={page}
        shape="rounded"
        onChange={(_, value) => router.push(`${basePath}?page=${value}`)}
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}
