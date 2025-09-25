class DatabaseInterface {
    async insertUser(user) { throw new Error("Not implemented"); }
    async getUsers() { throw new Error("Not implemented"); }
    async completeMeal(userId) { throw new Error("Not implemented"); }
  }
  module.exports = DatabaseInterface;