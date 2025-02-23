import { describe, it, beforeEach, expect } from "vitest"

describe("Storage Contract", () => {
  let mockStorage: Map<string, any>
  let nextNodeId: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextNodeId = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-storage-node":
        const [capacity] = args
        nextNodeId++
        mockStorage.set(`storage-node-${nextNodeId}`, {
          operator: sender,
          capacity: capacity,
          used_space: 0,
        })
        return { success: true, value: nextNodeId }
      
      case "store-mind-state":
        const [mindStateId, nodeId, encryptionKey] = args
        const node = mockStorage.get(`storage-node-${nodeId}`)
        if (!node) return { success: false, error: 404 }
        if (node.used_space >= node.capacity) return { success: false, error: 409 }
        node.used_space++
        mockStorage.set(`mind-state-storage-${mindStateId}`, {
          node_id: nodeId,
          encryption_key: encryptionKey,
        })
        return { success: true }
      
      case "get-storage-info":
        return { success: true, value: mockStorage.get(`mind-state-storage-${args[0]}`) }
      
      case "get-storage-node":
        return { success: true, value: mockStorage.get(`storage-node-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register a storage node", () => {
    const result = mockContractCall("register-storage-node", [100], "operator1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should store a mind state", () => {
    mockContractCall("register-storage-node", [100], "operator1")
    const result = mockContractCall("store-mind-state", [1, 1, "0xencryptionkey"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not store a mind state when node is full", () => {
    mockContractCall("register-storage-node", [1], "operator1")
    mockContractCall("store-mind-state", [1, 1, "0xencryptionkey1"], "user1")
    const result = mockContractCall("store-mind-state", [2, 1, "0xencryptionkey2"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(409)
  })
  
  it("should get storage info for a mind state", () => {
    mockContractCall("register-storage-node", [100], "operator1")
    mockContractCall("store-mind-state", [1, 1, "0xencryptionkey"], "user1")
    const result = mockContractCall("get-storage-info", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      node_id: 1,
      encryption_key: "0xencryptionkey",
    })
  })
  
  it("should get storage node information", () => {
    mockContractCall("register-storage-node", [100], "operator1")
    const result = mockContractCall("get-storage-node", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      operator: "operator1",
      capacity: 100,
      used_space: 0,
    })
  })
})

