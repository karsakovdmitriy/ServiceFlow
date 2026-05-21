import asyncio
from playwright.async_api import async_playwright
import os

async def verify_ux_updates():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # 1. Verify New Entry Modal
        await page.goto('http://localhost:3000')
        await page.wait_for_selector('button:has-text("Новая запись")')
        await page.click('button:has-text("Новая запись")')
        await page.wait_for_selector('h2:has-text("Новая запись")')
        await page.screenshot(path='/home/jules/verification/screenshots/new_entry_modal.png')
        await page.click('button:has-text("Отмена")')

        # 2. Verify Services Page
        await page.goto('http://localhost:3000/services')
        await page.wait_for_selector('div:has-text("Ваши услуги")')
        await page.screenshot(path='/home/jules/verification/screenshots/services_page.png')

        # 3. Verify Schedule Page (Editable Times)
        await page.goto('http://localhost:3000/schedule')
        await page.wait_for_selector('input[type="time"]')
        await page.screenshot(path='/home/jules/verification/screenshots/schedule_editable.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_ux_updates())
