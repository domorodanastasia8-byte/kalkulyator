import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Калькулятор роста — Анастасия Домород',description:'Калькулятор и рабочая таблица собственника'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
