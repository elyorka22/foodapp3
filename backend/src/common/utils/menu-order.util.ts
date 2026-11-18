type MenuCategoryLike = {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number | null;
  imageUrl?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  icon?: string | null;
};

type MenuProductLike = {
  sortOrder: number;
  createdAt: Date;
  dishCategoryId?: string | null;
  productCategoryId?: string | null;
  dishCategory?: MenuCategoryLike | null;
  productCategory?: MenuCategoryLike | null;
};

function categorySortOrder(product: MenuProductLike, restaurantMenu: boolean): number {
  if (restaurantMenu) {
    return product.dishCategory?.sortOrder ?? 999_999;
  }
  return product.productCategory?.sortOrder ?? 999_999;
}

export function sortMenuProducts<T extends MenuProductLike>(
  products: T[],
  restaurantMenu: boolean,
): T[] {
  return [...products].sort((a, b) => {
    const byCategory = categorySortOrder(a, restaurantMenu) - categorySortOrder(b, restaurantMenu);
    if (byCategory !== 0) return byCategory;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function buildMenuCategoriesFromProducts(
  products: MenuProductLike[],
  restaurantMenu: boolean,
): Array<{
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  imageUrl?: string | null;
  imageScale?: number | null;
  imagePositionX?: number | null;
  imagePositionY?: number | null;
  icon?: string | null;
}> {
  const map = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      sortOrder: number;
      imageUrl?: string | null;
      imageScale?: number | null;
      imagePositionX?: number | null;
      imagePositionY?: number | null;
      icon?: string | null;
    }
  >();

  for (const product of products) {
    const category = restaurantMenu ? product.dishCategory : product.productCategory;
    if (!category) continue;
    if (!map.has(category.id)) {
      map.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder ?? 0,
        imageUrl: category.imageUrl ?? null,
        imageScale: category.imageScale ?? 100,
        imagePositionX: category.imagePositionX ?? 50,
        imagePositionY: category.imagePositionY ?? 50,
        icon: category.icon ?? null,
      });
    }
  }

  return [...map.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
  );
}
