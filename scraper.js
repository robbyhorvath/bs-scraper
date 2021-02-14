const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');
const config = require('./config');

const username = config.username;
const password = config.password;
const zipcode = config.zipcode;
const writefile = config.writefile;

(async function scrape() {
	try {
		const driver = await new Builder().forBrowser('firefox').build();
		// get login page
		await driver.get(
			`https://brickseek.com/login?redirect_to=https://brickseek.com/local-markdown-feed?zip=${zipcode}`
		);
		await driver.findElement(By.id('user-login')).sendKeys(username);
		await driver
			.findElement(By.id('user-password'))
			.sendKeys(password, Key.RETURN);

		driver.wait(() => {
			until.elementIsVisible(By.name('item-list__tile'));
		});

		await sleep(3000);

		let logger = await fs.createWriteStream(writefile, { flags: 'a' });

		let elements = await driver.findElements(
			By.className('item-list__tile')
		);
		elements.forEach(async (element) => {
			let name = await element
				.findElement(
					By.xpath(".//span[@class='item-list__title']//span")
				)
				.getText();
			let dollars = await element
				.findElement(
					By.xpath(".//span[@class='price-formatted__dollars']")
				)
				.getText();
			let cents = await element
				.findElement(
					By.xpath(".//span[@class='price-formatted__cents']")
				)
				.getText();
			console.log(`Product: ${name}. Price: $${dollars}.${cents}`);
		});
		logger.end();
	} catch (err) {
		console.error(err);
	}
})();

function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
