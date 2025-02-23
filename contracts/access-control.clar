;; Access Control Contract

(define-map access-permissions
  { mind-state-id: uint }
  {
    owner: principal,
    authorized-users: (list 20 principal)
  }
)

(define-public (set-access-permissions (mind-state-id uint) (authorized-users (list 20 principal)))
  (let
    ((current-permissions (default-to { owner: tx-sender, authorized-users: (list) } (map-get? access-permissions { mind-state-id: mind-state-id }))))
    (asserts! (is-eq (get owner current-permissions) tx-sender) (err u403))
    (ok (map-set access-permissions
      { mind-state-id: mind-state-id }
      {
        owner: tx-sender,
        authorized-users: authorized-users
      }
    ))
  )
)

(define-public (add-authorized-user (mind-state-id uint) (user principal))
  (let
    ((current-permissions (unwrap! (map-get? access-permissions { mind-state-id: mind-state-id }) (err u404))))
    (asserts! (is-eq (get owner current-permissions) tx-sender) (err u403))
    (ok (map-set access-permissions
      { mind-state-id: mind-state-id }
      (merge current-permissions
        { authorized-users: (unwrap! (as-max-len? (append (get authorized-users current-permissions) user) u20) (err u401)) }
      )
    ))
  )
)

(define-read-only (check-access (mind-state-id uint) (user principal))
  (match (map-get? access-permissions { mind-state-id: mind-state-id })
    permissions (or
      (is-eq (get owner permissions) user)
      (is-some (index-of (get authorized-users permissions) user))
    )
    false
  )
)

(define-read-only (get-access-permissions (mind-state-id uint))
  (map-get? access-permissions { mind-state-id: mind-state-id })
)

