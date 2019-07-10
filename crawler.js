const puppeteer = require('puppeteer');

function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function result({title, commentsLastIdx, link, commentRes}) {
  return `제목: ${title}
댓글 수: ${commentsLastIdx + 1}
Link: ${link}
------------------------------------------
${commentRes}
`;
}

async function login(page, id, password) {
  await page.type( "#user_id", id );
  await page.type( "#user_pw", password, {delay: 100});

  const loginBtn = await page.$('.btn_login');
  await loginBtn.press('Enter');
}

function crawler(id, password) {
  const resultList = [];

  puppeteer.launch({
    headless: false,
    devtools: false
  }).then(async browser => {
    const page = await browser.newPage();
    await page.goto('http://whatsup.nhnent.com/');

    // 1. Login
    await login(page, id, password);

    console.log('로그인 완료 👉');

    // 2. My Auction 링크 들어가기, 테스트는 럭키 옥션!
    await page.waitForXPath('//a[contains(text(), "My Auction")]');
    const [myAuctionBtn] = await page.$x("//a[contains(text(), 'My Auction')]");
    await myAuctionBtn.click();

    // 3. 리스트 긁기
    await page.waitFor('.tit a');
    const listLen = (await page.$$('td.tit')).length;

    await page.waitFor('td.tit a');
    const elem = await page.$('td.tit a');
    await elem.click();

    console.log('찾는중 👉');

    for(let i = 1; i <= listLen; i += 1) {
      let commentRes = '획득하신 분👑 ';
      await page.waitFor('.view_tit .fl .tit');
      const title = await page.$eval('.view_tit .fl .tit', (el) => el.innerText);
      await page.waitFor('.post_info .fr a');
      const link = await page.$eval('.post_info .fr a', (el) => el.href);

      if(!title.includes('Gram') && !title.includes('총무')) {
        await page.waitFor('.view_cmt .comment_area');
        const comments = await page.$$('.view_cmt .comment_area');
        const commentsLastIdx = comments.length - 1;
        const commentList = [];
        for(let i = 1; i < 4; i += 1) {
          const idx = commentsLastIdx - i;
          if (idx < 0) {
            break;
          }

          const comment = comments[commentsLastIdx - i];
          
          const name = await comment.$eval('.info_area .name span', (el) => el.innerText);
          const price = await comment.$eval('.txt', (el) => el.innerText);
          commentRes += `${name}: ${price}\n`;
        }

        resultList.push(
          result({
            title,
            commentsLastIdx,
            link,
            commentRes
          })
        );
      }

      // 4. 다음 페이지로 이동
      await page.waitFor('.view_top .fl .btn_next');
      const nextPageBtn = await page.$('.view_top .fl .btn_next');
      if(nextPageBtn) {
        await nextPageBtn.click();
        await delay(1000);
      }
    }

    resultList.forEach((result) => {
      console.log(result);
    });
    
    await browser.close();
    console.log('----끗----');
  });
}

module.exports = {
  crawler
};
