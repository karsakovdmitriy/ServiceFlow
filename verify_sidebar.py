import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        # Mocking auth
        await page.goto('http://localhost:3000/')
        await page.wait_for_timeout(3000)

        # Take screenshot of sidebar area
        await page.screenshot(path='sidebar_v2.png')

        # Click role switcher
        try:
            await page.click('button:has-text("Мастер")')
            await page.wait_for_timeout(1000)
            await page.screenshot(path='role_switcher_open.png')
        except:
            print("Could not find role switcher button")

        # Check for logout button
        logout_btn = await page.query_selector('button:has-text("Выйти")')
        if logout_btn:
            print("Logout button found")
        else:
            print("Logout button NOT found")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
