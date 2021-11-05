// create a mock of natswrapper and export it
const natsWrapper = {
    client: {
        publish: jest.fn().mockImplementation((subject, data, callback) => {
            callback();
        }
        ),
    },
};
