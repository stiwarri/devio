const comments = [
    {
        _id: '101',
        parentId: '0',
        user: 'David',
        text: 'Awesome',
        replies: [
            {
                _id: '101-1',
                parentId: '101',
                user: 'John',
                text: 'Haha',
                replies: [
                    {
                        _id: '101-1-1',
                        parentId: '101-1',
                        user: 'Clarke',
                        text: 'Hehe',
                        replies: [],
                    },
                ],
            },
            {
                _id: '101-2',
                parentId: '101',
                user: 'Harry',
                text: 'Lol',
                replies: [],
            },
        ],
    },
    {
        _id: '102',
        parentId: '0',
        user: 'Marry',
        text: 'Superb',
        replies: [],
    },
]

const addComment = (parentId, comment) => {
    let found = false
    const recursiveAdd = comments => {
        for (let com of comments) {
            if (com._id === parentId) {
                found = true
                com.replies.unshift(comment)
            } else {
                recursiveAdd(com.replies)
            }
        }
    }
    recursiveAdd(comments);
    if (!found) console.log('Comment not found')
    else console.log(comments)
}

addComment('102', {
    _id: '102-1',
    parentId: '102',
    user: 'James',
    text: 'Hehehohoho',
    replies: [],
});
