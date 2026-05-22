export type Category = {
  id: string;
  name_ar: string;
  slug: string;
  order: number;
};

export type PromptItem = {
  id: string;
  title_ar: string;
  prompt_ar: string;
  category: string;
  usage: string;
  tags: string[];
  created_at: string;
};
