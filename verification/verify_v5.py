import asyncio
from playwright.async_api import async_playwright
import os

async def verify_v5():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # 1. Login or check Sidebar (Demo mode should work)
        await page.goto('http://localhost:3000')
        # Sidebar profile info
        await page.wait_for_selector('.text-t1:has-text("Алексей (Демо)")')
        await page.screenshot(path='/home/jules/verification/screenshots/sidebar_profile.png')

        # 2. Schedule Toggle
        await page.goto('http://localhost:3000/schedule')
        toggle = await page.wait_for_selector('.bg-green-custom')
        await page.screenshot(path='/home/jules/verification/screenshots/schedule_before_toggle.png')

        # 3. New Entry Modal (Portal check)
        await page.goto('http://localhost:3000')
        await page.click('button:has-text("Новая запись")')
        await page.wait_for_selector('h2:has-text("Новая запись")')
        # The modal should be a child of body
        is_child_of_body = await page.evaluate('document.querySelector(".fixed.inset-0.z-\\\\[9999\\\\]").parentElement === document.body')
        print(f"Modal is child of body: {is_child_of_body}")
        await page.screenshot(path='/home/jules/verification/screenshots/modal_portal.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_v5())
