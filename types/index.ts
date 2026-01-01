export interface Category {
	id: string;
	name: string;
	image_url?: string;
	description?: string;
}

export interface Product {
	id: string;
	title: string;
	description: string;
	short_description?: string;
	price: number;
	original_price?: number;
	rating: number;
	image_url: string;
	category_id: string;
	stock: number;
	is_featured: boolean;
}

export interface CartItem extends Product {
	quantity: number;
}
