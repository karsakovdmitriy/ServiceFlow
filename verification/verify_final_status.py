import asyncio
from playwright.async_api import async_playwright
import os

async def verify_status():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # We need to bypass auth check if we want to see settings or be in login
        await page.goto('http://localhost:3000/login')
        await page.screenshot(path='/home/jules/verification/screenshots/login_page_final.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_status())
