import asyncio
from playwright.async_api import async_playwright
import os

async def verify_final():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # 1. Verify Centered Modal with Screenshots
        await page.goto('http://localhost:3000')
        await page.wait_for_selector('button:has-text("Новая запись")')
        await page.click('button:has-text("Новая запись")')
        await page.wait_for_timeout(500)
        await page.screenshot(path='/home/jules/verification/screenshots/centered_modal_v2.png')

        # 2. Check if loading state is handled (implicit wait for content)
        await page.goto('http://localhost:3000/requests')
        # Since Supabase might return empty, check for container card
        await page.wait_for_selector('.card')
        await page.screenshot(path='/home/jules/verification/screenshots/requests_supabase.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_final())
