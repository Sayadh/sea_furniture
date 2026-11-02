export type UploadFolder = 'products' | 'categories' | 'services' | 'portfolio' | 'settings';

const MAX = 5 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function useAdminUpload() {
  const { request } = useAdminApi();
  const toast = useToast();

  async function upload(file: File, folder: UploadFolder): Promise<{ url: string; path: string } | null> {
    if (!TYPES.includes(file.type)) {
      toast.error(`«${file.name}»․ թույլատրվում են միայն JPG, PNG, WEBP կամ AVIF նկարներ`);
      return null;
    }
    if (file.size > MAX) {
      toast.error(`«${file.name}» ֆայլը 5 ՄԲ-ից մեծ է`);
      return null;
    }
    const body = new FormData();
    body.append('file', file);
    try {
      return await request<{ url: string; path: string }>('/admin/uploads', { method: 'POST', query: { folder }, body });
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Նկարը վերբեռնել չհաջողվեց'));
      return null;
    }
  }

  return { upload, accept: TYPES.join(',') };
}
