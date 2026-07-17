export type Profile = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    can_invite: boolean;
    can_create_app: boolean;
    can_view_logs: boolean;
    created_at: string;
    is_active: boolean;
}

export const MOCK_USERS: Profile[] = [
    // Page 1
    { id: '1247ab65-7119-4a68-ae3e-0d2f115e9511', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '733b75f3-3e38-427b-a007-d3102ac801e1', email: 'test@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6cf1fe68-0d3a-4582-a481-1a3b96efffe9', email: 'benyapa.thon@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '24a1fdea-54e8-45db-bbc1-8836f3bc28c8', email: 'autstudio12345@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '51814c0a-f423-45fb-b688-b749b235b830', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '5d1f1fe1-3a47-44e4-a376-29842955f96b', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '11063fa2-dbe0-4df0-9496-8b1d979613d8', email: 'pichayapa@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '5b88775b-5550-4037-a46e-a4492dce4a2c', email: 'autstudio1234@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },

    // Page 2
    { id: '773db60f-91cf-427b-a700-dd2f39c6f70f', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'ec201ccb-e67b-43e7-bb93-316dda8a37f0', email: 'test+1@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '3e7e4bd3-6b79-40b3-bb30-4f31c02cd31c', email: 'thon+1@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '4b0ef018-3b74-43be-9e47-ad55bd747577', email: 'aut@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '2d9268e2-2bf9-4a6d-9e08-ee63c9c33ffc', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'fe00980f-b2a3-4a73-84b4-bfc11025a421', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '199472bc-699d-41ed-bdc7-c780d351d9b3', email: 'pichaya@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'd013a106-3b8c-4f1f-b745-ec7a5e86b88a', email: 'studio1234+1@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },

    // Page 3
    { id: '151c0692-11f2-41be-9547-f4f8fa0aa056', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6b1e063b-3c9a-4f69-8985-4ccd8d6e317f', email: 'test+2@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6412ba5e-112b-40a7-b970-fb1f4117ff4a', email: 'benyapa.thon+2@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6fecf4d4-4659-4cc9-8ccc-0e88fd0ee4d8', email: 'autstudio12345+2@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '41dc3e59-8983-4051-af60-47de6512e806', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6058d8e6-219c-49f8-b6cc-102d071eb7b6', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6dd29b45-ba5d-4988-b1b2-f2361dd1bf22', email: 'pichayapa+2@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'eb14f111-7310-445f-a844-cd8847c524f8', email: 'autstudio1234+2@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },

    // Page 4
    { id: 'de7835b9-b1d1-4038-979e-bd9b393f57e1', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'e03cf355-e493-47ed-88cb-ba625bef3922', email: 'test+3@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'a673c46c-793b-4902-b2ff-4fc3c9ecb5cb', email: 'benjii@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'ca68663b-35a0-41e0-90ce-14df892d549b', email: 'autstudio12345+3@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '63049bd5-240b-43a3-9fef-5d7a240227d7', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'a5380481-2ccb-48d2-b976-d7580cb30c78', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '6f5c6d7e-a85b-49ab-a521-6657c9391fe3', email: 'pichayapa+3@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'fd34229b-bf95-4560-88ba-a5b954465949', email: 'autstudio1234+3@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },

    // Page 5
    { id: 'f02c0a28-7c24-4f8f-93df-602d56c9c1f3', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '5e1cb0c3-bd0e-4e07-bb95-c3e88d9c04c1', email: 'test+4@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '1ffae7fb-577f-499f-b158-fe2fa5826c27', email: 'benyapa.thon+4@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'db8a73c1-b3c1-409d-9191-d03a5edd8576', email: 'autstudio12345+4@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'ff4534a1-f6dc-4bcd-aa2b-94d8b1edd110', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'bfb36abc-cbe3-413c-af08-b3999d7cc51e', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'fdd53347-aa3a-4b2a-af33-c77f5d6bf1c1', email: 'pichayapa+4@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'e628ed11-ad20-420b-b6ac-c9f2629a3739', email: 'autstudio1234+4@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },

    // Page 6
    { id: 'fc8653f9-23ab-4a98-b0d3-baef07b3f5e0', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '40faa3de-0348-4dd9-b78d-410f19783fe9', email: 'test+5@mail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '60e33b41-fdfd-4ddf-85dd-2132eb7edc74', email: 'benyapa.thon+5@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '9818ace0-9b0d-47cc-8f00-c75dfa8e86ee', email: 'autstudio12345+5@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'd474e4e9-64f9-4ed0-8239-ac52189977d3', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '915aafdc-c286-46aa-9b11-462e9e200032', email: '', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: 'f9928d8b-f6d6-4fb6-81cf-099d7277e1b1', email: 'pichayapa+5@thunder.co.th', first_name: '', last_name: '', role: 'super_admin', can_invite: true, can_create_app: true, can_view_logs: true, created_at: '2026-07-17T00:00:00Z', is_active: true },
    { id: '470b21db-efab-4386-aea7-7f1944bdc84e', email: 'autstudio1234+5@gmail.com', first_name: '', last_name: '', role: 'User', can_invite: false, can_create_app: false, can_view_logs: false, created_at: '2026-07-17T00:00:00Z', is_active: true }
]
