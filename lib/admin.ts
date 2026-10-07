import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
export async function isOwner(){const user=await getChatGPTUser();const owner=(env as unknown as Record<string,string>).OWNER_EMAIL;return Boolean(user&&owner&&user.email.toLowerCase()===owner.toLowerCase());}
