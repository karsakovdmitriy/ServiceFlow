import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:3000/')
        await page.wait_for_timeout(2000)

        # Open switcher - search for the button with the chevron
        await page.click('button:has(svg.lucide-chevron-down)')
        await page.wait_for_timeout(1000)

        # Click Client in the dropdown
        # Try to find by text in the portal
        await page.click('div:text("Клиент")')
        await page.wait_for_timeout(1000)

        # Verify sidebar changed
        # "Мои записи" should be present in Client role
        has_my_bookings = await page.query_selector('text="Мои записи"')
        if has_my_bookings:
            print("Role switch to Client successful: found 'Мои записи'")
        else:
            print("Role switch to Client failed")

        await page.screenshot(path='client_view.png')

        # Switch to Venue
        await page.click('button:has(svg.lucide-chevron-down)')
        await page.wait_for_timeout(1000)
        await page.click('div:text("Площадка")')
        await page.wait_for_timeout(1000)

        has_staff = await page.query_selector('text="Мастера"')
        if has_staff:
            print("Role switch to Venue successful: found 'Мастера'")
        else:
            print("Role switch to Venue failed")

        await page.screenshot(path='venue_view.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
