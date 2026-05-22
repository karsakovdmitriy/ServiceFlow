import asyncio
from playwright.async_api import async_playwright
import os

async def verify_auth():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # 1. Verify Redirect to Login
        await page.goto('http://localhost:3000')
        await page.wait_for_url('**/login')
        await page.screenshot(path='/home/jules/verification/screenshots/auth_redirect.png')

        # 2. Verify Login Page UI
        h1 = await page.inner_text('h1')
        assert h1 == 'TrainerSpace'
        await page.screenshot(path='/home/jules/verification/screenshots/login_page.png')

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists('/home/jules/verification/screenshots'):
        os.makedirs('/home/jules/verification/screenshots')
    asyncio.run(verify_auth())
