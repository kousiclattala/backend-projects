//base - Product.find({email: "test@gmail.com"})

//bigQ - search=test&category=shortsleeves&ratings[gte]=3&price[lte]=999&price[gte]=199

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }

  search() {
    //where ever we are using this method we send bigQ as object,
    //i.e. by default express is converting the url query into object,
    // when access using "req.query", so we check whether in that object,
    // if there is a key with the name "search", if it is there we use that
    // to query the database as Product.find({name: {$regex: this.bigQ.search, $options: 'i'}})

    const searchWord = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find(searchWord);
    return this;
  }

  filter() {
    var copyOfBigQ = this.bigQ;

    delete copyOfBigQ["search"];
    delete copyOfBigQ["page"];
    delete copyOfBigQ["limit"];

    let stringOfCopyQ = JSON.stringify(copyOfBigQ);

    stringOfCopyQ = stringOfCopyQ.replace(
      /\b(gte | lte | gt | lt)\b/g,
      (m) => `$${m}`
    );

    var jsonOfCopyQ = JSON.parse(stringOfCopyQ);

    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  pager(resultPerPage) {
    let currentPage = 1;

    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }

    const skipVal = resultPerPage * (currentPage - 1);

    // limit method limits the amount is items should be shown in a page
    // skip method skips the amount of items based on limitPerPage and show the remaining items.
    // on page 1, if the limit = 5,then on page 2 the items will be skipped by 5 and shown from 6...

    this.base = this.base.limit(resultPerPage).skip(skipVal);
    return this;
  }
}

module.exports = WhereClause;
