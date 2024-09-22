const responseTypeDefs = `#graphql

interface Response {
    statusCode: String!
    message: String
}

type UserLoginData {
    token: String
}

type UserResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: UserMongoDb
}

type UserLoginResponse implements Response {
    statusCode: String!
    message: String
    data: UserLoginData
}
`;

module.exports = { responseTypeDefs };
