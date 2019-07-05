import jwt from 'jsonwebtoken';

const getUserId = ({ request: { header: { authorization } } }) => {

    if (!authorization) throw new Error('Authentication Required');

    const token = authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, 'thisisasecret');

    return userId
};

export default getUserId;