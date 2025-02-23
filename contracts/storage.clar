;; Storage Contract

(define-map storage-nodes
  { node-id: uint }
  {
    operator: principal,
    capacity: uint,
    used-space: uint
  }
)

(define-map mind-state-storage
  { mind-state-id: uint }
  {
    node-id: uint,
    encryption-key: (buff 32)
  }
)

(define-data-var next-node-id uint u0)

(define-public (register-storage-node (capacity uint))
  (let
    ((node-id (+ (var-get next-node-id) u1)))
    (var-set next-node-id node-id)
    (ok (map-set storage-nodes
      { node-id: node-id }
      {
        operator: tx-sender,
        capacity: capacity,
        used-space: u0
      }
    ))
  )
)

(define-public (store-mind-state (mind-state-id uint) (node-id uint) (encryption-key (buff 32)))
  (let
    ((node (unwrap! (map-get? storage-nodes { node-id: node-id }) (err u404))))
    (asserts! (>= (- (get capacity node) (get used-space node)) u1) (err u409))
    (map-set storage-nodes
      { node-id: node-id }
      (merge node { used-space: (+ (get used-space node) u1) })
    )
    (ok (map-set mind-state-storage
      { mind-state-id: mind-state-id }
      {
        node-id: node-id,
        encryption-key: encryption-key
      }
    ))
  )
)

(define-read-only (get-storage-info (mind-state-id uint))
  (map-get? mind-state-storage { mind-state-id: mind-state-id })
)

(define-read-only (get-storage-node (node-id uint))
  (map-get? storage-nodes { node-id: node-id })
)

