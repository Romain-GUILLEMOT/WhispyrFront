import {z} from "zod";

// Le type pour un salon
export interface Channel {
    channel_id: string;
    name: string;
    type: string;
}
interface Category {
    category_id: string;
    name: string;
    channels: Channel[];
}

export interface ChannelsAPI {
    categories: Category[];
    uncategorized_channels: Channel[];
}
