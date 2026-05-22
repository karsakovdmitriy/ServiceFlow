import asyncio
from playwright.async_api import async_playwright
import os

async def verify_new_ux():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # 1. Verify New Entry Modal Centering
        await page.goto('http://localhost:3000')
        await page.wait_for_selector('button:has-text("Новая запись")')
        await page.click('button:has-text("Новая запись")')
        # Check if modal is visible and roughly centered
        modal = await page.wait_for_selector('h2:has-text("Новая запись")')
        await page.screenshot(path='/home/jules/verification/screenshots/centered_modal.png')
        await page.click('button:has-text("Отмена")')

        # 2. Verify Requests Page Sections
        await page.goto('http://localhost:3000/requests')
        await page.wait_for_selector('div:has-text("Завершенные записи")')
        await page.screenshot(path='/home/jules/verification/screenshots/requests_with_completed.png')

        # 3. Verify Clients Filter
        await page.goto('http://localhost:3000/clients')
        await page.wait_for_selector('button:has-text("Все")')
        await page.click('button:has-text("Все")')
        await page.wait_for_timeout(500)
        await page.screenshot(path='/home/jules/verification/screenshots/clients_all.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_new_ux())
