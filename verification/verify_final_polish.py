import asyncio
from playwright.async_api import async_playwright
import os

async def verify_final_polish():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # We assume the user is already redirected to login or we need to bypass it for verification if possible
        # For now, we'll just check the presence of specific elements on pages that should be populated

        await page.goto('http://localhost:3000/settings')
        await page.screenshot(path='/home/jules/verification/screenshots/settings_final.png')

        await page.goto('http://localhost:3000/schedule')
        await page.screenshot(path='/home/jules/verification/screenshots/schedule_final.png')

        await page.goto('http://localhost:3000/services')
        await page.screenshot(path='/home/jules/verification/screenshots/services_final.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_final_polish())
