import jwt from 'jsonwebtoken';

const getUserId = ({ request: { header: { authorization } } }, requireAuth = true) => {

    if (authorization) {
        const token = authorization.replace('Bearer ', '');
        const { userId } = jwt.verify(token, 'thisisasecret');

        return userId;
    }

    if (requireAuth) {
        throw new Error('Authentication Required');
    }

    return null;
};

export default getUserId;