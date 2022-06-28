import auth from "../auth";

describe("Test auth.js", () => {
  beforeAll(() => {
    process.env.API_KEY = "TESTAPIKEY";
  });

  test("Auth should pass when API KEY is correct", async () => {
    const mockReq = {
      header: (name) => {
        if (name === "X-API-KEY") return "TESTAPIKEY";
      },
    };

    const mockNext = jest.fn();

    auth()(mockReq, {}, mockNext);

    expect(mockNext).toBeCalled();
  });

  test("Auth should return 401 when API KEY is incorrect", async () => {
    const mockReq = {
      header: (name) => {
        if (name === "X-API-KEY") return "TESTAIPKEY";
      },
    };

    const mockRes = {
      sendStatus: jest.fn(),
    };

    auth()(mockReq, mockRes, {});

    expect(mockRes.sendStatus).toBeCalledWith(401);
  });

  test("Auth should pass when GitHub signature is correct", async () => {
    const mockReq = {
      header: (name) => {
        if (name === "X-Hub-Signature-256")
          return "sha256=87b859722424bd09a59ebbd3924cf5d408fe7a80693b18090f8851e2d74854ce";
      },
      body: { data: "test data" },
    };

    const mockNext = jest.fn();

    auth()(mockReq, {}, mockNext);

    expect(mockNext).toBeCalled();
  });

  test("Auth should return 401 when GitHub signature is incorrect", async () => {
    const mockReq = {
      header: (name) => {
        if (name === "X-Hub-Signature-256")
          return "sha256=87b859722424bd09a59ebbd3924cf5d408fe728537293857921e2d74854ce";
      },
      body: { data: "test data" },
    };

    const mockResInner = {
      send: jest.fn(),
    };

    const mockRes = {
      status: jest.fn().mockReturnValue(mockResInner),
    };

    auth()(mockReq, mockRes, {});

    expect(mockRes.status).toBeCalledWith(401);
    expect(mockResInner.send).toBeCalled();
  });
});
