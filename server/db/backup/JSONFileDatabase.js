const fs = require('fs');
const path = require('path');
const DatabaseInterface = require('./DatabaseInterface');

class JSONFileDatabase extends DatabaseInterface {
  constructor() {
    super();
    this.filePath = path.join(__dirname, 'users.json');
    this.users = fs.existsSync(this.filePath) ? 
      JSON.parse(fs.readFileSync(this.filePath)) : [];
  }

  async insertUser(user) {
    const newUser = { ...user, id: Date.now(), points: 0, level: 1 };
    this.users.push(newUser);
    fs.writeFileSync(this.filePath, JSON.stringify(this.users));
    return newUser;
  }
}
module.exports = JSONFileDatabase;