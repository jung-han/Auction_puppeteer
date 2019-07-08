const puppeteer = require('puppeteer');

function printResult({title, commentsLastIdx, link, commentList}) {
  console.log(`제목: ${title}
댓글 수: ${commentsLastIdx + 1}
Link: ${link}
------------------------------------------`);
  commentList.forEach((comment, index) => {
    if(comment.includes('최종 낙찰자')) {
      return;
    }
    console.log(index === 0 ? `가져가실 분 👉 ${comment}` : comment);
  });
  console.log('\n');
}

async function login(page, id, password) {
  await page.type( "#user_id", id );
  await page.type( "#user_pw", password, {delay: 100});

  const loginBtn = await page.$('.btn_login');
  await loginBtn.press('Enter');
}

function crawler(id, password, query) {
  puppeteer.launch({
    headless: true,
    devtools: false
  }).then(async browser => {
    const page = await browser.newPage();
    await page.goto('http://whatsup.nhnent.com/');

    // 1. Login
    await login(page, id, password);

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

    for(let i = 1; i <= listLen; i += 1) {
      await page.waitFor('.view_tit .fl .tit');
      const title = await page.$eval('.view_tit .fl .tit', (el) => el.innerText);
      await page.waitFor('.post_info .fr a');
      const link = await page.$eval('.post_info .fr a', (el) => el.href);

      await page.waitFor('.view_cmt .comment_area');
      const comments = await page.$$('.view_cmt .comment_area');
      const commentsLastIdx = comments.length - 1;
      const commentList = [];
      for(let i = 0; i < 3; i += 1) {
        const idx = commentsLastIdx - i;
        if (idx < 0) {
          break;
        }

        const comment = comments[commentsLastIdx - i];
        const name = await comment.$eval('.info_area .name span', (el) => el.innerText);
        const price = await comment.$eval('.txt', (el) => el.innerText);
        commentList.push(`${name}: ${price}`);
      }


      if(query.length > 0) {
        if(title.includes(query)) {
          printResult({
            title,
            commentsLastIdx,
            link,
            commentList
          });
        }
      } else {
        printResult({
          title,
          commentsLastIdx,
          link,
          commentList
        });
      }

      // 4. 다음 페이지로 이동
      const nextPageBtn = await page.$('.view_top .fl .btn_next');
      if(nextPageBtn) {
        await nextPageBtn.click();
      }
    }

    await browser.close();
    console.log('----끗----');
  });
}

module.exports = {
  crawler
};
