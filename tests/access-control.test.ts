import { describe, it, beforeEach, expect } from "vitest"

describe("Access Control Contract", () => {
  let mockStorage: Map<string, any>
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "set-access-permissions":
        const [mindStateId, authorizedUsers] = args
        mockStorage.set(`access-${mindStateId}`, {
          owner: sender,
          authorized_users: authorizedUsers,
        })
        return { success: true }
      
      case "add-authorized-user":
        const [addMindStateId, newUser] = args
        const permissions = mockStorage.get(`access-${addMindStateId}`)
        if (!permissions) return { success: false, error: 404 }
        if (permissions.owner !== sender) return { success: false, error: 403 }
        permissions.authorized_users.push(newUser)
        return { success: true }
      
      case "check-access":
        const [checkMindStateId, checkUser] = args
        const checkPermissions = mockStorage.get(`access-${checkMindStateId}`)
        if (!checkPermissions) return { success: true, value: false }
        return {
          success: true,
          value: checkPermissions.owner === checkUser || checkPermissions.authorized_users.includes(checkUser),
        }
      
      case "get-access-permissions":
        return { success: true, value: mockStorage.get(`access-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should set access permissions", () => {
    const result = mockContractCall("set-access-permissions", [1, ["user2", "user3"]], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should add an authorized user", () => {
    mockContractCall("set-access-permissions", [1, ["user2"]], "user1")
    const result = mockContractCall("add-authorized-user", [1, "user3"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not allow non-owner to add authorized user", () => {
    mockContractCall("set-access-permissions", [1, ["user2"]], "user1")
    const result = mockContractCall("add-authorized-user", [1, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
  
  it("should check access correctly", () => {
    mockContractCall("set-access-permissions", [1, ["user2", "user3"]], "user1")
    expect(mockContractCall("check-access", [1, "user1"], "anyone").value).toBe(true)
    expect(mockContractCall("check-access", [1, "user2"], "anyone").value).toBe(true)
    expect(mockContractCall("check-access", [1, "user4"], "anyone").value).toBe(false)
  })
  
  it("should get access permissions", () => {
    mockContractCall("set-access-permissions", [1, ["user2", "user3"]], "user1")
    const result = mockContractCall("get-access-permissions", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      owner: "user1",
      authorized_users: ["user2", "user3"],
    })
  })
})

