import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/muaythai-speed/', // <--- เพิ่มบรรทัดนี้ (ต้องมีเครื่องหมาย / ปิดหัวท้ายชื่อ Repo)
})