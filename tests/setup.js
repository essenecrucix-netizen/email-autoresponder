// Mock global functions
global.reportError = jest.fn();
global.invokeAIAgent = jest.fn();

// Mock TrickleObjectAPI
global.TrickleObjectAPI = jest.fn(() => ({
    createObject: jest.fn(),
    updateObject: jest.fn(),
    getObject: jest.fn(),
    listObjects: jest.fn(),
    deleteObject: jest.fn()
}));
