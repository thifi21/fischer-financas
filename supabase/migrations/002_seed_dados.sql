-- ============================================================
-- SEED: Contas Família Fischer 2026
-- Execute no Supabase SQL Editor APÓS criar o usuário em Authentication
-- Substitua 'SEU_USER_ID_AQUI' pelo UUID do seu usuário
-- Para encontrar: Authentication > Users > copie o UUID
-- ============================================================

DO $$
DECLARE
  uid UUID := 'SEU_USER_ID_AQUI';
BEGIN

  -- ============================================================
  -- CARTÕES DE CRÉDITO
  -- ============================================================
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '242aa350-31ca-449b-a235-4a4e67668ca8', uid, 1, 2026,
    'Hipercard', '10/01',
    632.1, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '0632f5ba-cbe1-499b-a442-4ac41fe8e920', uid, 2, 2026,
    'Hipercard', '10/02',
    438.04, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', uid, 3, 2026,
    'Hipercard', '10/03',
    363.05, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '903e5ec2-3bcc-4921-80a9-a7a9f54ca1a7', uid, 4, 2026,
    'Hipercard', '10/04',
    248.55, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '51768fe5-2f22-4baa-a3ba-40aec38ec232', uid, 5, 2026,
    'Hipercard', '10/05',
    248.55, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'c51eafaf-59c3-4140-907e-3197d4192489', uid, 6, 2026,
    'Hipercard', '10/06',
    248.55, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '943aff5a-1c3d-45d8-8796-e19f7f143ef8', uid, 7, 2026,
    'Hipercard', '10/07',
    248.59, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'f2c98561-b580-4bb3-b927-9b85bebb0e42', uid, 8, 2026,
    'Hipercard', '10/08',
    163.1, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '3703722e-bc10-490b-9740-ee53e59cfe51', uid, 9, 2026,
    'Hipercard', '10/09',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '598afb28-4e67-42a6-b052-75c2ba892450', uid, 10, 2026,
    'Hipercard', '10/10',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '9ef3f736-25cc-42cf-9819-4d8a798ceb96', uid, 11, 2026,
    'Hipercard', '10/11',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'de299215-301b-475c-8862-06b888bac3df', uid, 12, 2026,
    'Hipercard', '10/12',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'dc103b10-953d-4bda-9a55-314acfe75e0f', uid, 1, 2026,
    'Cartão Crédito Caixa', '09/01',
    916.1, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '2a35f1eb-a434-4695-88a9-c4937d2ea15b', uid, 2, 2026,
    'Cartão Crédito Caixa', '09/02',
    791.37, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ce5c21b3-0264-4909-90cf-9e0538364218', uid, 3, 2026,
    'Cartão Crédito Caixa', '09/03',
    1016.56, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'c8b63728-f778-4289-b0fc-1ed83b284ebd', uid, 4, 2026,
    'Cartão Crédito Caixa', '09/04',
    949.22, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', uid, 5, 2026,
    'Cartão Crédito Caixa', '09/05',
    426.47, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '11f93613-1051-42b1-a72e-61c0f99c7203', uid, 6, 2026,
    'Cartão Crédito Caixa', '09/06',
    426.47, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'fa372a83-309b-4514-ae0e-2d2e3b4916f3', uid, 7, 2026,
    'Cartão Crédito Caixa', '09/07',
    426.47, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', uid, 8, 2026,
    'Cartão Crédito Caixa', '09/08',
    392.12, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '63ef9866-53dc-4f88-b62d-9193a9797681', uid, 9, 2026,
    'Cartão Crédito Caixa', '09/09',
    392.12, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'efbfab14-d275-4e67-bb1d-d378af5769e6', uid, 10, 2026,
    'Cartão Crédito Caixa', '10/10',
    575.08, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'dae28eed-73c2-43d4-9dcd-295d62147f36', uid, 11, 2026,
    'Cartão Crédito Caixa', '10/11',
    575.08, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '02738678-1d7f-4560-b2fa-ad70e4ec37ca', uid, 12, 2026,
    'Cartão Crédito Caixa', '10/12',
    500.77, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '40bb923d-9765-4e61-817a-ffe0c164f764', uid, 1, 2026,
    'Nu Bank', '12/01',
    833.29, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'cec94bfc-ca74-4df6-9777-69ee6756cb94', uid, 2, 2026,
    'Nu Bank', '14/02',
    1047.81, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '7b8f59e3-de97-423a-9411-97acd15ce5b7', uid, 3, 2026,
    'Nu Bank', '2025-03-12 00:00:00',
    957.61, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', uid, 4, 2026,
    'Nu Bank', '12/04',
    1078.92, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '59edbf2e-e80b-4514-8b98-104da4bbf5c1', uid, 5, 2026,
    'Nu Bank', '12/05',
    593.17, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ab743a7a-8c8c-4f52-820b-f5613021dcb2', uid, 6, 2026,
    'Nu Bank', '14/06',
    543.18, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'e24f3f70-beca-40ab-9bc3-63de54653bda', uid, 7, 2026,
    'Nu Bank', '12/07',
    478.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '38f4b567-90a5-4d7f-b511-6b8d06d23c4a', uid, 8, 2026,
    'Nu Bank', '12/08',
    247.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '19e8bbec-fab2-4285-a270-cca6b561ece6', uid, 9, 2026,
    'Nu Bank', '12/09',
    247.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '0a67a1ca-c1a2-4792-a728-55ab3af27d6e', uid, 10, 2026,
    'Nu Bank', '13/10',
    247.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '25e98f6e-3459-42cc-a2b0-686a56a47476', uid, 11, 2026,
    'Nu Bank', '12/11',
    247.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'd671c25a-808b-4c6a-9bd9-766233a3fe22', uid, 12, 2026,
    'Nu Bank', '13/12',
    247.42, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '8b014714-45e3-4a34-9972-d1b90d0c71de', uid, 1, 2026,
    'Amazon Prime', '15/01',
    788.09, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', uid, 2, 2026,
    'Amazon Prime', '2023-02-15 00:00:00',
    940.51, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ea63260a-9a24-4586-80a4-d9fa1567a4ea', uid, 3, 2026,
    'Amazon Prime', '15/03',
    821.28, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', uid, 4, 2026,
    'Amazon Prime', '15/04',
    847.52, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', uid, 5, 2026,
    'Amazon Prime', '15/05',
    418.82, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'adba37b6-58b7-4cca-9c2a-3c683a99333f', uid, 6, 2026,
    'Amazon Prime', '15/06',
    274.34, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '9c631ce9-f75f-46c0-80da-06ee2c5aa246', uid, 7, 2026,
    'Amazon Prime', '15/07',
    274.34, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', uid, 8, 2026,
    'Amazon Prime', '15/08',
    230.99, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'ee95724c-6d2c-42ec-8586-a1afda917e90', uid, 9, 2026,
    'Amazon Prime', '15/09',
    230.99, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', uid, 10, 2026,
    'Amazon Prime', '15/10',
    148.48, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'c53e790b-d12e-4840-b8b5-d40b61ad27e8', uid, 11, 2026,
    'Amazon Prime', '15/11',
    148.48, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '552bd2c4-e76d-42d4-9926-ed4b841e9867', uid, 12, 2026,
    'Amazon Prime', '15/12',
    118.18, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '011d0d5e-4a32-4541-baa4-a980e07f1514', uid, 1, 2026,
    'Mercado Pago', '20/01',
    909.56, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '68b23554-1456-49be-af96-9826790d1930', uid, 2, 2026,
    'Mercado Pago', '20/02',
    857.83, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '747a795c-f54d-4a29-9f92-ca3f5780ff21', uid, 3, 2026,
    'Mercado Pago', '20/03',
    770.87, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', uid, 4, 2026,
    'Mercado Pago', '20/04',
    439.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'df81ebaf-c40c-4521-9360-750f9e365168', uid, 5, 2026,
    'Mercado Pago', '20/05',
    439.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'f3ad0be3-ed27-408e-bca1-0771982a5719', uid, 6, 2026,
    'Mercado Pago', '20/06',
    259.59, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'a170cf48-5d67-40e4-adae-dc5735e170fe', uid, 7, 2026,
    'Mercado Pago', '20/07',
    250.01, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'db0cb23d-678b-463c-b709-a44a9d124528', uid, 8, 2026,
    'Mercado Pago', '20/08',
    226.28, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '77fd04b2-f9e6-4c51-96a5-541bce89cca4', uid, 9, 2026,
    'Mercado Pago', '20/09',
    150.67, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '240f978e-7c23-4181-a527-c9c42393340c', uid, 10, 2026,
    'Mercado Pago', '20/10',
    126.69, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '90b32fb6-9b7a-4f39-8a9c-41d0be8d8df9', uid, 11, 2026,
    'Mercado Pago', '20/11',
    94.2, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'c119da38-4143-4a88-ba70-bb715c97e5e4', uid, 12, 2026,
    'Mercado Pago', '20/12',
    94.2, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '908e0d9d-addb-4f4d-b467-5ca1ba545daa', uid, 1, 2026,
    'C6 Nara', '20/01',
    331.97, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '90bf531e-0b2b-4534-b920-0a48b698fba3', uid, 2, 2026,
    'C6 Nara', '20/02',
    554.08, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '1feab0ad-2714-4c7d-b119-46bfa88ad040', uid, 3, 2026,
    'C6 Nara', '20/03',
    285.82, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'e0b9a5ba-4078-46d9-9c27-975dcf1feb89', uid, 4, 2026,
    'C6 Nara', '20/04',
    285.82, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '3f7abc16-1815-406b-a490-5a2dc17edae6', uid, 5, 2026,
    'C6 Nara', '20/05',
    136.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '8844f1f5-3a8f-45eb-90eb-8dffaca14b9d', uid, 6, 2026,
    'C6 Nara', '20/06',
    136.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '96e8764e-bf81-4a12-919c-0330ae66e114', uid, 7, 2026,
    'C6 Nara', '20/07',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    'd653daed-22c1-4908-9d1b-52d2c8d8aad6', uid, 8, 2026,
    'C6 Nara', '20/08',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '4084fd3f-3abd-4802-bfba-87c2c7416468', uid, 9, 2026,
    'C6 Nara', '20/09',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '8774bd6d-2855-411e-8dbc-3394ff5bd4ad', uid, 10, 2026,
    'C6 Nara', '20/10',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '57f42b26-ef2e-4f4e-aa04-7d47a8c43e1c', uid, 11, 2026,
    'C6 Nara', '20/11',
    0.0, FALSE
  );
  INSERT INTO cartoes (id, user_id, mes, ano, nome, vencimento, valor, pago) VALUES (
    '4f0bb9a1-f19b-43fb-9296-0d255c173c5b', uid, 12, 2026,
    'C6 Nara', '20/12',
    0.0, FALSE
  );

  -- ============================================================
  -- LANÇAMENTOS DE CARTÃO
  -- ============================================================
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2e63125c-6499-4801-9785-6a54e8f5f697', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-07-16', 'Drogaria Cat.',
    '06/06', 57.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9ea1d06d-f395-43e3-b132-50123f26cfd4', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-07-18', 'Boticário',
    '06/08', 59.57
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8bec931c-ba7c-414c-a6bd-d504de35a472', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-07-26', 'Decathlon',
    '06/07', 113.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0584f267-a739-4d5c-b3c3-8688822987f2', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-08-07', 'Bestlaser',
    '05/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b9f88eba-d25a-4d50-a5b7-02df61d9bdcb', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-09-04', 'Cassol',
    '04/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '89bda18c-c1e8-4552-9c0a-b6a4f36384ba', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-10-11', 'Drogaria Cat.',
    '03/05', 54.89
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dff9e054-3553-483d-a9d1-7972889e3a6b', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-11-08', 'La Belle',
    '02/02', 67.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '210fddae-433e-4006-af28-7d3a8cb1f706', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-11-08', 'Lojas G',
    '02/03', 44.64
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e78cf31a-f4cb-47ae-89b4-cdcdf23ec07f', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-11-08', 'Carioca',
    '01/02', 61.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6dcd6150-2ed3-4624-9d21-89c1cb7abfa0', uid, '242aa350-31ca-449b-a235-4a4e67668ca8', 1, 2026,
    '2025-12-02', 'Point Nutrição',
    '01/01', 8.36
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '46351352-0e1f-4e09-9946-8fd69a7e51bb', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-07-18', 'Boticário',
    '07/08', 59.57
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd5b3e0a3-1314-4af9-bb6e-54662baabf74', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-07-26', 'Decathlon',
    '07/07', 113.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7d3c32c6-23af-40c7-9cb2-1eebc20dc758', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-08-07', 'Bestlaser',
    '06/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7f11ff9a-bb97-4661-ad8f-d39da8479462', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-09-04', 'Cassol',
    '05/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6467edf0-4db9-4fd2-8082-6778cbffaf22', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-10-11', 'Drogaria Cat.',
    '04/05', 54.89
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6fceb881-068a-4f5a-9e7c-a89a53419b78', uid, '0632f5ba-cbe1-499b-a442-4ac41fe8e920', 2, 2026,
    '2025-11-08', 'Carioca',
    '03/03', 44.64
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c00506a2-1d11-4b75-99fe-1a8c979f1dc9', uid, 'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', 3, 2026,
    '2025-07-18', 'Boticário',
    '08/08', 59.57
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c0765eae-dc97-4b81-b9fc-47bfbdf6c2d5', uid, 'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', 3, 2026,
    '2025-08-07', 'Bestlaser',
    '07/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c530acb9-265e-4d9d-94b9-9d4be8adc3ab', uid, 'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', 3, 2026,
    '2025-09-04', 'Cassol',
    '06/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '855f71fb-926d-46e5-8c3f-780444b2c096', uid, 'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', 3, 2026,
    '2025-10-11', 'Drogaria Cat.',
    '05/05', 54.89
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '898a4713-111d-4c6e-a4d0-8ae92eb833d7', uid, 'abf62516-f993-4c1e-9ecd-f2e2002fd6bb', 3, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '01/06', 83.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0f208585-fb5b-44d0-b989-4afc818274ec', uid, '903e5ec2-3bcc-4921-80a9-a7a9f54ca1a7', 4, 2026,
    '2025-08-07', 'Bestlaser',
    '08/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3e366714-1c0a-4424-8606-d3b567e4f1bd', uid, '903e5ec2-3bcc-4921-80a9-a7a9f54ca1a7', 4, 2026,
    '2025-09-04', 'Cassol',
    '07/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1a95d91b-ac22-4f3a-8eea-467a473fe850', uid, '903e5ec2-3bcc-4921-80a9-a7a9f54ca1a7', 4, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '02/06', 83.16
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c4c72144-5e4c-49f8-af8d-9518c803e854', uid, '51768fe5-2f22-4baa-a3ba-40aec38ec232', 5, 2026,
    '2025-08-07', 'Bestlaser',
    '09/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '78d2858f-0a56-4a27-a17b-52f9af6cb795', uid, '51768fe5-2f22-4baa-a3ba-40aec38ec232', 5, 2026,
    '2025-09-04', 'Cassol',
    '08/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6390ad01-b180-45e1-b809-7f2b36ebd31f', uid, '51768fe5-2f22-4baa-a3ba-40aec38ec232', 5, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '03/06', 83.16
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3a17ec24-5f52-4025-90b4-4ce2af05aabe', uid, 'c51eafaf-59c3-4140-907e-3197d4192489', 6, 2026,
    '2025-08-07', 'Bestlaser',
    '10/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b8a91473-610a-45f8-a9dc-56f25a74cb0b', uid, 'c51eafaf-59c3-4140-907e-3197d4192489', 6, 2026,
    '2025-09-04', 'Cassol',
    '09/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '726bfb6a-aa12-40ad-86d5-2406029d38e8', uid, 'c51eafaf-59c3-4140-907e-3197d4192489', 6, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '04/06', 83.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a9bb4001-77ea-4d4b-964c-3f7e1b34327e', uid, '943aff5a-1c3d-45d8-8796-e19f7f143ef8', 7, 2026,
    '2025-08-07', 'Bestlaser',
    '11/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2f8983a3-eeb7-4b21-baac-7184524506fb', uid, '943aff5a-1c3d-45d8-8796-e19f7f143ef8', 7, 2026,
    '2025-09-04', 'Cassol',
    '10/10', 85.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '019cabc1-b835-4aea-babf-6522fb6c0df3', uid, '943aff5a-1c3d-45d8-8796-e19f7f143ef8', 7, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '05/06', 83.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '36c9a2e7-c7a2-4662-a2ce-e03656bf9dc0', uid, 'f2c98561-b580-4bb3-b927-9b85bebb0e42', 8, 2026,
    '2025-08-07', 'Bestlaser',
    '12/12', 79.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '78be1523-cf6c-432a-98cb-4255b4220306', uid, 'f2c98561-b580-4bb3-b927-9b85bebb0e42', 8, 2026,
    '2026-02-11', 'Polo Das Baterias',
    '06/06', 83.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4406de87-c105-418f-9c65-761441111c88', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2023-12-15', 'Anuidade',
    '02/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '00a52a1e-4393-4c98-bd43-0a8525bfe39c', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '60f5ab58-301e-4e14-a425-def1b87b66d1', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e709848e-2440-4871-b075-912ab4542b6f', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fd5c55b7-56ec-42e2-9c2d-58e81208df15', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-07-28', 'CAOPI',
    '05/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4d6513dd-0e3a-49d3-9bab-2ac5b30ae3f2', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-07-28', 'CAOPI',
    '05/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '48f9131c-144c-488b-bc31-b05917859446', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-08-28', 'Curitiba',
    '04/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e2b56619-fd4a-4cc1-8dd6-75277e7f9ad7', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-25', 'Kalzone',
    '01/01', 13.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6376ec6b-c18d-4179-9dfc-2d5dfe25340f', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-25', 'McDonalds',
    '01/01', 4.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '57d5f729-ca98-4829-809f-6ee0f396dc58', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-25', 'Uber',
    '01/01', 11.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '21ff53b0-9b21-4f34-809c-ebf8ae6d5e1a', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-25', 'BK',
    '01/01', 105.7
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8518058e-1424-49b9-bca0-30ba7ec1280b', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-26', 'Komprao',
    '01/01', 43.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3efda47e-3e54-48b5-9dab-1a9fe08c9b47', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-26', 'Vizinhão',
    '01/01', 35.44
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '383935eb-f864-4ee8-910f-b3b249bf49e8', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-27', 'Komprao',
    '01/01', 47.16
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ad1dbd6a-236e-4a45-aac7-b0e4d1e59c58', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-27', 'Uber',
    '01/01', 12.16
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '39184096-cba6-47f9-a65d-43ca07385b05', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-27', 'Pichau',
    '01/12', 111.28
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '64215f86-ce3f-46e5-87d7-de91fc0d4298', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Pão da Vida',
    '01/01', 58.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0ba57adf-78d8-46b0-9fa4-719050ae45be', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Transtusa',
    '01/01', 10.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '298fb3a3-2f95-4ec5-a217-c4df00496196', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Amazon',
    '01/12', 67.66
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'aaab14dc-e3ab-468e-8f42-f5f259605998', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Uber',
    '01/01', 16.96
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2a684726-fc00-4d96-83c1-222474f938c6', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Zheng',
    '01/01', 57.7
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fb8ca593-48bc-4394-be6f-7344ada69c64', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', '99',
    '01/01', 13.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5cac0154-76f4-4881-8f47-b6f2d9eaa21c', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Mercadinho',
    '01/01', 14.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bb1a14cb-d746-41ed-83bb-db95a948fa00', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Subway',
    '01/01', 22.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '11f014fa-5eb0-4c16-895b-b2fa91df7aed', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-28', 'Burger King',
    '01/01', 4.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c0f31464-4e6b-49f9-a795-93a71bfa8977', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-11-24', 'Fabripães',
    '01/01', 16.16
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd9592b5f-827a-40d6-8f0e-ec6b9cc28751', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-12-05', 'Amazon',
    '01/01', -161.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c35a475b-5e89-4ca0-88bc-4f327a348f6d', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-12-12', 'Transtusa',
    '01/01', 10.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fbb1f825-a329-424e-ad4e-27099b0dd9e9', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-12-12', 'Santana',
    '01/01', 43.43
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1e397fe5-9107-42e9-9bc7-7295ac3b64fe', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-12-14', 'Quiosque',
    '01/01', 8.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c2eb15de-4d35-4e6d-b01f-a0ac4726e886', uid, 'dc103b10-953d-4bda-9a55-314acfe75e0f', 1, 2026,
    '2025-12-15', 'Mafalda',
    '01/01', 15.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e954d952-8079-4170-8da5-2318c4cad387', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2023-12-15', 'Anuidade',
    '03/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0ea7cffb-79fe-41f7-a9ca-14c15157d0d1', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '823e7fca-8568-4717-b4b0-65ed6a63420b', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '26f53aef-a465-453a-a495-95a766bdcab6', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '89733fc2-5993-4f80-8d23-def16f540d38', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-07-28', 'CAOPI',
    '06/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '37990adb-0c62-461a-b666-9387819f007a', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-07-28', 'CAOPI',
    '06/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3daffcea-9d3b-414d-971c-fabd75081b90', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-08-28', 'Curitiba',
    '05/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2b057d7c-abce-4e6d-b2be-e9747f54245d', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-11-27', 'Pichau',
    '02/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'be4f488c-a9bb-46e7-802b-e2563470dbda', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-11-28', 'Amazon',
    '02/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '91c8bb0d-476d-452c-a83d-68a570cfa65e', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-26', 'Milium',
    '01/01', 4.62
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '49951dce-0d81-4433-86a0-4fe072fc3396', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-26', 'Farmácia Preço Popular',
    '01/01', 9.78
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f0810eff-08d9-4b30-83ba-8a7ccca00e96', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-26', 'Truck Valley',
    '01/01', 50.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c6eb2117-1424-4331-9fdb-fcbae5b3e342', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-26', 'Capitão Franguito',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '09cdc1a3-320c-47ca-bfdc-b41a35698f7e', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-27', 'Santana',
    '01/01', 43.44
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a2cbeb2f-c7a8-4291-b72a-4ec942fe2702', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-27', 'Koch',
    '01/01', 61.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1aa8dd6c-4d61-4313-8583-94df08a69d0b', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2025-12-28', 'Picolés',
    '01/01', 40.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8857dc6d-7e53-4369-ad52-b5ee679c694b', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2026-12-30', 'Marmita',
    '01/01', 31.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a9f64227-f621-46f5-b2cd-f10a5e9af507', uid, '2a35f1eb-a434-4695-88a9-c4937d2ea15b', 2, 2026,
    '2026-01-16', 'Tilmann',
    '01/01', 12.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '495eb766-27a9-4396-b0f8-24b617703bc9', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2023-12-15', 'Anuidade',
    '04/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f2830271-a742-471b-84b2-436b9adcf301', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8ab51896-0c79-4062-932b-a4e52ca32ecb', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '63b6d748-a64a-4c43-a737-8cf1183e33bb', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b01da55b-0924-4448-8eee-f0a2fc6baf4a', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-07-28', 'CAOPI',
    '07/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3b489e00-9299-4605-8940-15e90a9bf527', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-07-28', 'CAOPI',
    '07/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '71daf330-efe8-4e2b-a201-e41afb0f9ba8', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-08-28', 'Curitiba',
    '06/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '42f04418-5eac-4968-bbe8-f7984e5271d9', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-11-27', 'Pichau',
    '03/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5af71611-049c-4d39-a19b-959442be6501', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2025-11-28', 'Amazon',
    '03/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '47bcbcbe-8f3c-4ade-8ab4-5297833e9442', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-23', 'Guesser',
    '01/01', 76.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5471c89a-ad29-4fc5-af4a-e70b08c8915e', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-26', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6a39abda-8ec9-4b97-be53-bd7a24cf7a42', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-26', 'Flores',
    '01/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9d111abd-9af9-4add-ba32-4db639784f75', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-26', 'Netshoes',
    '01/02', 69.95
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '25fc5903-d9dc-40ab-a480-1c42301a9e21', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-26', 'Point da Nutrição',
    '01/01', 34.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1efb81b5-7648-4767-9c62-d8adf99ce907', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-27', 'Santana',
    '01/01', 36.09
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3a17154d-a644-44c9-9367-e246e641f7e0', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-27', 'Komprao',
    '01/01', 40.53
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7f753ec3-44a6-40a0-b7d1-e75dee3212f6', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-27', 'Shopee',
    '01/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '72d98d1d-1ad3-4684-be01-2f7a32f865d8', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-28', 'Tribess',
    '01/01', 85.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '08d5b0b8-0af0-42cd-998d-c74c529fb315', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-28', 'Mafalda',
    '01/01', 4.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a3607ef-c364-4da0-9340-90587efecf02', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-01-28', 'BK',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5f83f422-181c-431a-95f3-87b248095f65', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-02-05', '99',
    '01/01', 15.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dc834ac5-221f-4758-b006-c5e2fb239862', uid, 'ce5c21b3-0264-4909-90cf-9e0538364218', 3, 2026,
    '2026-02-06', '99',
    '01/01', 7.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7692d7f6-6c0c-464d-9cda-9d84fdadf797', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2023-12-15', 'Anuidade',
    '05/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7f418a4e-3ecc-40b5-815a-39f01d971e89', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '28d3093f-26a8-4deb-92b5-d0cdc5f21765', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1cf1791d-da7e-428d-bd48-6d2dff77af47', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a32ba5e-efc4-4a2f-82c0-348cbb94738f', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2025-08-28', 'Curitiba',
    '07/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0554e3b8-775b-4cbb-a255-9dc9e6bee27d', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2025-11-27', 'Pichau',
    '04/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8ed0943b-d2f9-4bf4-bd2d-1d7ba6483efd', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2025-11-28', 'Amazon',
    '04/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '38936857-dfcb-450b-874f-30e9b88fc236', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-01-26', 'Flores',
    '02/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a45f771a-b686-4795-a325-0a80ab7befd2', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-01-26', 'Netshoes',
    '02/02', 69.94
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e6c68d92-2229-42d5-b156-e44146632820', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-01-27', 'Shopee',
    '02/09', 74.28
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '09909c70-f194-44eb-83ab-771a1af61a4c', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-20', 'Shopee',
    '01/05', 103.64
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '268c5d12-56d1-423d-b5f8-be7bdf2fd1e1', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-21', 'Vendinha',
    '01/01', 22.72
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ad0b6bc2-058b-4219-865a-e98b149700fc', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-21', 'Fabripaes',
    '01/01', 33.07
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c47e0a5b-daf0-49f9-8aa4-38c28378b09d', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-22', 'Shopee',
    '01/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'cbbc4690-fc9e-4d3a-b5d6-21a14827ff6f', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-23', 'Fabripaes',
    '01/01', 6.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd27b98e0-48e8-4c01-b759-20143d080258', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-23', 'Santana',
    '01/01', 29.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4e7dd1c9-bfa2-4d13-ac1d-099fba80b1c9', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-23', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '33aaa713-19ab-40d0-963b-dec26a2d86d5', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-23', '99',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '45bb0cf6-77ac-4bd0-9b2c-ae853aafb3dd', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-24', 'Posto',
    '01/01', 170.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e7e4f8a0-376a-42c2-b5f1-024b0b6fd445', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-24', 'MC',
    '01/01', 4.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'df719b81-c949-4cea-b9c8-efb486f3bb04', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-26', 'Avatim',
    '01/01', 22.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '501df328-5041-4bbf-88ad-e2f5973445ec', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-26', 'MC',
    '01/01', 4.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '156a2eda-fc66-464d-96ec-9a1fa94c7e2b', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-02-26', 'Passebus',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1ac41d04-ad4f-4db4-8f99-ac131de07f5b', uid, 'c8b63728-f778-4289-b0fc-1ed83b284ebd', 4, 2026,
    '2026-03-18', '99',
    '01/01', 9.84
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '31d6575e-5390-4542-abb3-6a5e73f9be7a', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2023-12-15', 'Anuidade',
    '06/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7c528e1e-6f3d-4cd9-a8a2-2dfa37d7313c', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b48553d1-e835-43d9-9ab7-da7e4fef9d13', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8316e78d-7f74-44ea-8c71-9ce96b1ff4dd', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c6ef0b48-0ef2-4940-a58c-96dde04f1574', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2025-08-28', 'Curitiba',
    '08/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3b6a6542-ccc7-4528-a303-be0f1c382028', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2025-11-27', 'Pichau',
    '05/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'da6894b8-c4d8-4497-9d91-3a74b8e649ba', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2025-11-28', 'Amazon',
    '05/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fe55b8f5-95c1-4b7e-93db-cbca6b29d88b', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2026-01-26', 'Flores',
    '03/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '46856624-6a22-4236-b8dc-a862f0a4a525', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2026-01-27', 'Shopee',
    '03/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '242955d9-5f00-426f-b937-872e38708b72', uid, '1d2f2c8a-78e3-4dc4-b2b6-82118266264a', 5, 2026,
    '2026-02-22', 'Shopee',
    '02/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '31a99a53-9832-483c-9ac2-a0ea8e023aae', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2023-12-15', 'Anuidade',
    '07/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '34535071-fc04-4274-9723-15eaa957af1f', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '28c17b03-9fbd-4a7e-b824-17402ce55fb5', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1ce780ba-8443-4f3e-98b3-5045c077a13a', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4275de88-664d-462d-8871-4626b17fda1e', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2025-08-28', 'Curitiba',
    '09/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1f1a1a39-ba4d-4f49-a4fc-9f5914f71e13', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2025-11-27', 'Pichau',
    '06/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '928f9db1-cc1f-4b25-beff-841b2169d2f2', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2025-11-28', 'Amazon',
    '06/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b041846c-2301-4486-9717-7718d57bdf15', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2026-01-26', 'Flores',
    '04/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd6f00929-f46f-4b18-9521-0d3cae272743', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2026-01-27', 'Shopee',
    '04/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '82fa10fc-1079-4a45-a3e4-4cf392ee8c82', uid, '11f93613-1051-42b1-a72e-61c0f99c7203', 6, 2026,
    '2026-02-22', 'Shopee',
    '03/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2b026fbd-81c6-47d0-8c13-2037eadc28aa', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2023-12-15', 'Anuidade',
    '08/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '92a2f435-5351-4fab-906c-bdc88f775c4a', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a3a9b5f3-1324-42aa-8152-9329865d6716', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '94ad695a-dac9-4d64-aa9c-fc77d54414d7', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0dfdfbaf-d6fa-4a00-9c69-8e3860e183c7', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2025-08-28', 'Curitiba',
    '10/10', 34.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '526c1b9e-f903-4b79-a91c-3b536d893f89', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2025-11-27', 'Pichau',
    '07/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6014afc2-fded-4973-982e-a485e274cb36', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2025-11-28', 'Amazon',
    '07/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '10c359b5-9c12-4782-bd3b-c02379cc5e88', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2026-01-26', 'Flores',
    '05/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '136a7dba-89ea-4247-9fc9-89055d8e94b5', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2026-01-27', 'Shopee',
    '05/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a57509d1-1770-4bf4-af25-daf3cfda7642', uid, 'fa372a83-309b-4514-ae0e-2d2e3b4916f3', 7, 2026,
    '2026-02-22', 'Shopee',
    '04/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '425d5d9f-cd52-42a7-abc2-93172d2e4a05', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2023-12-15', 'Anuidade',
    '09/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2b4f010a-0440-44f5-905b-632ea8097f3f', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '024d9a35-6218-4419-ba83-b5efddf4606f', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e80f5d21-59e3-448e-a9f3-8e4c95305de9', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a20c21bf-331e-4191-9c13-f9c2cfd607e7', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2025-11-27', 'Pichau',
    '08/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '87772eb7-e0f4-4697-9c1e-e4d53a63acf7', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2025-11-28', 'Amazon',
    '08/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f0ace3b0-7627-4479-847c-7f4317facf51', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2026-01-26', 'Flores',
    '06/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'df40013a-fa16-4798-85f1-f219008eeefa', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2026-01-27', 'Shopee',
    '06/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e50a73eb-8603-448a-b76b-f950bacf97bb', uid, '138f43a9-8f6a-4b41-86f8-d66b2f0f293c', 8, 2026,
    '2026-02-22', 'Shopee',
    '05/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '16a13191-08ba-4e4f-b692-c19659ffdb25', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2023-12-15', 'Anuidade',
    '10/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c826a1a4-45bc-4849-81e0-abfa18cd8899', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3bd82c54-d669-4401-b66d-7f3445461c6d', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'edddedb3-3a27-420d-a4ef-5cf3eafae39a', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1ccc20ee-dec1-423c-8770-498477613773', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2025-11-27', 'Pichau',
    '09/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4a5ab379-f3e4-4b51-a6ee-fe12ad8b3079', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2025-11-28', 'Amazon',
    '09/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5e86617a-e903-46e6-a787-797d984a6d6f', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2026-01-26', 'Flores',
    '07/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '338202b6-e634-4d6d-b922-a81a72a4d118', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2026-01-27', 'Shopee',
    '07/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6edbd60e-7335-4098-a498-8bf4749c59fc', uid, '63ef9866-53dc-4f88-b62d-9193a9797681', 9, 2026,
    '2026-02-22', 'Shopee',
    '06/06', 67.04
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0cbb99d7-269f-40b2-8d19-773c8f07a621', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2023-12-15', 'Anuidade',
    '11/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd9763c2b-eb9c-48ca-af9a-9ba8aca39c13', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6b1d32af-faec-4ce4-9628-d372e3cc0cc1', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9326f15b-076e-40c3-b37f-36aff822ba5d', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '982ab737-e807-4970-bae3-7f7dc508ddc1', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-07-28', 'CAOPI',
    '02/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bfbec570-8183-4145-bb5c-eda99c5c786e', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-07-28', 'CAOPI',
    '02/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '86c0eb1c-cb2d-4782-ba21-61822994a0b8', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-11-27', 'Pichau',
    '10/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ff4db599-aa62-43bd-8cce-61cb2e23acbc', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2025-11-28', 'Amazon',
    '10/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '40aa62cd-d858-4ef7-b327-926c9ca85e89', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2026-01-26', 'Flores',
    '08/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0b823ccb-0059-45df-8794-185740e6c78f', uid, 'efbfab14-d275-4e67-bb1d-d378af5769e6', 10, 2026,
    '2026-01-27', 'Shopee',
    '08/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8a32d221-27c4-426d-9365-a0d20836b271', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2023-12-15', 'Anuidade',
    '12/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8f0ee750-98f3-49f8-8f97-4daaf5a576c0', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a41c3fb1-8b45-44fb-8462-0c3acfe3ec67', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '43b78728-f438-475e-9f38-ffa7657f783f', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0dcfc1fd-bf27-4b89-86eb-0323870d043c', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-07-28', 'CAOPI',
    '03/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '274ea1a9-3a0e-484b-bc51-9877b940eba6', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-07-28', 'CAOPI',
    '03/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '73336a73-733c-45d4-b1d5-0fc71aeb6900', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-11-27', 'Pichau',
    '11/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'cbcba51e-e1b1-465f-ab82-1efb95f5161c', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2025-11-28', 'Amazon',
    '11/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '94294061-dd74-400e-9f12-2c7c82888a2c', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2026-01-26', 'Flores',
    '09/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '746f4277-b9fa-4bac-8033-24284723dfc1', uid, 'dae28eed-73c2-43d4-9dcd-295d62147f36', 11, 2026,
    '2026-01-27', 'Shopee',
    '09/09', 74.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ff1ef1a4-78d5-4bc2-ae6c-7cc9bc54903b', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2023-12-15', 'Anuidade',
    '01/12', 10.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c4539c9f-b89d-42d0-b5c0-fdef1f866c1f', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2024-07-24', 'Apple',
    '01/01', 5.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '91ff69c5-e164-497f-8390-8f993ee9f487', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-04-30', 'Spotify',
    '01/01', 23.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5a400595-90d6-4336-bc28-7c0a2a7e6fbf', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-07-12', 'Apple',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '69531d60-0b0b-440e-8997-16451bf246d2', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-07-28', 'CAOPI',
    '04/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'eefc8496-215f-4c00-b70f-9949928d01ef', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-07-28', 'CAOPI',
    '04/12', 125.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dddefbae-ba1b-4022-88cb-1b752802181f', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-11-27', 'Pichau',
    '12/12', 111.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7f891562-2590-42ec-b347-d9270cd92a21', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2025-11-28', 'Amazon',
    '12/12', 67.55
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'af38c499-5ff6-4dfe-af8b-0215970539f2', uid, '02738678-1d7f-4560-b2fa-ad70e4ec37ca', 12, 2026,
    '2026-01-26', 'Flores',
    '10/10', 21.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '84a29370-0605-4c9b-8dc0-0c1603b14843', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-06-07', 'Shopee',
    '07/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '342de42a-08ed-4469-8c6b-74b88cc57487', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-07-08', 'Shopee',
    '06/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '48863614-1942-4be6-a700-2699eeba3b51', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-08-07', 'ML',
    '05/05', 51.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '08740d62-e2ca-43ef-87c9-5082e6a2e3c3', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-09-05', 'Nike',
    '04/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8db2fa1e-ea2a-4885-9af2-45133a47066a', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-10', 'Growth',
    '04/05', 52.65
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '03e286c1-1d96-4d2a-8dd0-ca0c22350273', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-10', 'Shopee',
    '03/05', 69.29
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'be9b8cc6-05a5-4ebe-abd4-3f62656ff813', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-11-10', 'Drogaria Catarinense',
    '02/02', 39.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '72ec2e59-1d2a-4601-bb01-42a702d225a2', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-05', 'Terabyte',
    '01/12', 50.36
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '41f57c19-bf8b-4193-9902-773f367f2201', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-05', 'Pichau',
    '01/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e7b10698-87a5-43c9-b3ba-77f96f2e3365', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-06', 'Angeloni',
    '01/01', 1.45
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '65533f63-4b4d-4f74-ba26-dd9eddb56093', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-06', 'Cs Garten',
    '01/01', 44.91
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5accface-8eb1-4a23-9f4e-5b977118c0e6', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-07', 'Drogaria Catarinense',
    '01/03', 35.72
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5bded19f-8b24-40e2-84c6-b5e0a302c57d', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-08', 'Avatim',
    '01/03', 74.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1f55ee1a-e8b9-499c-8041-1390284c97aa', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-08', 'Mercadinho',
    '01/01', 28.62
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd9e8a650-b6a3-47a0-b77d-ea9179ea7e4e', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-10', 'Mercadinho',
    '01/01', 15.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4d52b9d3-d41f-47a1-aa82-b35bcab389d2', uid, '40bb923d-9765-4e61-817a-ffe0c164f764', 1, 2026,
    '2025-12-11', 'Mercadinho',
    '01/01', 28.15
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '40739ed6-c3cc-45c3-ae25-1c52472c3df5', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-06-07', 'Shopee',
    '08/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2610245b-f74d-47bd-971d-ec383f94efe7', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-07-08', 'Shopee',
    '07/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b7cb3571-4845-4e57-9f88-693ddcd773ea', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-09-05', 'Nike',
    '05/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd949a6f1-77c3-4b35-a03e-8288389a0d9f', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-10', 'Growth',
    '05/05', 52.65
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c6fba64a-90c8-4bc1-b5cd-f5f69ee520fc', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-10', 'Shopee',
    '04/05', 69.29
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0621f493-37b5-4059-bd77-8151dee81f6d', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-05', 'Terabyte',
    '02/12', 50.25
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bb3db3f5-9231-4c6d-95d9-31da66ef9a26', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-05', 'Pichau',
    '02/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9e90ad3e-32db-4588-8536-fc863612db71', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-07', 'Drogaria Catarinense',
    '02/03', 35.71
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f4f220a4-91ce-40ee-8905-62cd764bb75d', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2025-12-08', 'Avatim',
    '02/03', 74.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '492c672a-b150-40af-a8e5-da1462279268', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Gidion',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3963b23f-e2a7-4d81-927a-f2e349930c89', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Mafalda',
    '01/01', 4.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f5ce0c15-95cd-48d9-80ab-6f84cd62f125', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Pastelaria',
    '01/01', 9.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2d5b5883-7cd2-43d4-8b98-3c778d4aa484', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Santana',
    '01/01', 3.74
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'db81f4b0-81f5-4739-a5d8-14f110b638c6', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Garten',
    '01/01', 36.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd48f1ea8-ef0b-4923-8862-4bbe1ac40658', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Kfluz',
    '01/01', 43.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4f2e1724-df3d-47f3-948b-b7cf9634cc6c', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-07', 'Mc',
    '01/01', 10.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0d70c0f4-aacf-42fd-a7e7-9a959ca33478', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-09', 'Tillman',
    '01/01', 12.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd1d8310a-e412-4a0a-aab3-33e56418806f', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-13', 'Container',
    '01/01', 11.89
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2cf6dbf4-f7cf-4e2d-babc-f6fd7df89060', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-01-26', 'Angeloni',
    '01/01', 221.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3fc59fb5-0ee0-4a3c-ac2e-950732aa20b2', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-02-01', 'Mercadinho',
    '01/01', 36.42
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f7305d9c-b8b2-4fdf-847e-c0e9c568c71b', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-02-01', 'Drogaria Catarinense',
    '01/01', 6.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ecac0e2d-45ef-4f5e-8777-31e983b98b7b', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-02-02', 'Mafalda',
    '01/01', 4.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6bbeac7a-76d6-4a6e-949c-aa3f00597e80', uid, 'cec94bfc-ca74-4df6-9777-69ee6756cb94', 2, 2026,
    '2026-02-03', 'Mc Donalds',
    '01/01', 4.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fbedb3e7-385e-4efe-8bed-c15c2c9b4e6d', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-06-07', 'Shopee',
    '09/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '64334ffb-c22e-41ac-ae9d-93a835e9fec8', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-07-08', 'Shopee',
    '08/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b93a9862-48a0-4532-ae4f-5d81ab4dfc4e', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-09-05', 'Nike',
    '06/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3d8fe90a-75b5-429f-956b-8c9684a3bfc6', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-12-10', 'Shopee',
    '05/05', 69.29
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2edbf3c7-b2f0-4dd4-b097-3fcf3e475d99', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-12-05', 'Terabyte',
    '03/12', 50.25
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '636d603e-e1ff-41eb-b96e-2e6746581f71', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-12-05', 'Pichau',
    '03/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4ba26fb7-71dc-4878-ad6a-1893c421d06e', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-12-07', 'Drogaria Catarinense',
    '03/03', 35.71
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '57ee8dd8-3fa2-4cef-b759-948862fb4a98', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2025-12-08', 'Avatim',
    '03/03', 74.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f8f17424-921f-48f5-897c-9fb21aa08209', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-12', 'Pay2All',
    '01/12', 98.34
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd4dce005-276a-4f4d-aeac-14001997ff5a', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'Bobs',
    '01/01', 5.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '246c7ab3-771a-4e65-a315-3414b84e2f8f', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'Restaurante Samuara',
    '01/01', 44.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '050b4e07-1217-47e0-a65b-8a53a37e8fa9', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'BK',
    '01/01', 5.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ecc02037-91cb-4356-a192-c0b42ccd51ae', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'Mega1',
    '01/01', 26.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bd735075-32e8-4eeb-9165-e5e7de4cd928', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'Relocasio',
    '01/01', 25.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e0f4ee9c-a8b3-4fea-9d69-8416bc375445', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-06', 'Coffee',
    '01/01', 28.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b831393b-dfd1-4d6d-bc9e-5e7ddac4bd5c', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-07', 'Canva',
    '01/01', 35.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5ad6b1c3-e985-445f-a155-3a61b3f82cc4', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-09', 'Santana',
    '01/01', 5.92
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '66a5163a-6bf8-4926-ac96-d023b841201c', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-11', 'Livrarias Curitiba',
    '01/01', 43.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c07bd4e0-89eb-41c0-a332-b700bab870da', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-12', 'Vendinha',
    '01/01', 15.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '11f4ae79-7ec7-465d-8939-dd55e3b070c9', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-12', 'Kalzone',
    '01/01', 31.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1d2923da-c349-440a-93a2-0f8aa648c5a3', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-16', 'Vendinha',
    '01/01', 14.08
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a6b607f7-7803-4a38-92f1-11a9d47c25cf', uid, '7b8f59e3-de97-423a-9411-97acd15ce5b7', 3, 2026,
    '2026-02-20', 'Vendinha',
    '01/01', 7.56
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e3d24093-4a47-4325-a0d3-0c54a6761da4', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2025-06-07', 'Shopee',
    '10/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f34d5b8d-06e2-4c5c-9c8a-c1728b645fb1', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2025-07-08', 'Shopee',
    '09/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '845c0c36-362f-495e-ae36-c35c0c22bf00', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2025-09-05', 'Nike',
    '07/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2bd21bd1-b338-43bf-a48b-040c6a6d31de', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2025-12-05', 'Terabyte',
    '04/12', 50.25
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '03925bcb-817b-4636-8815-6273b5a18dbb', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2025-12-05', 'Pichau',
    '04/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd4ca4050-ac69-448d-877b-8b90f7e025cc', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-12-01', 'Pay2All',
    '02/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '71735eff-9a29-4f37-b0d5-b6c54d7669f2', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-05', 'Vendinha',
    '01/01', 11.89
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '773885d2-d9fd-4efb-8497-ef92b4bc6fef', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Passe',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c9a200a2-e2d8-4b06-9813-ee2fb503ce25', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Passe',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e966a8ba-8e44-4042-967e-917157c77698', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Tilmann',
    '01/01', 14.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7644a9a8-f877-450d-ba6d-83f169dbcfaf', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Chilli',
    '01/04', 52.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1e93b3e6-d99c-4f87-8b42-e91859478795', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Flor Nara',
    '01/02', 50.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4aea23ad-f94d-47e0-bfd2-e1bfba8be5fc', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-06', 'Aliexpress',
    '01/10', 67.34
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'adf7763e-b0aa-443e-bb76-fa81475f448f', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-08', 'Fit World',
    '01/01', 54.18
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1165af4d-752e-457d-a467-0b8b4befa945', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-08', 'The Best Acai',
    '01/01', 52.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5fbb61ac-4b4b-44b6-a1fb-6623e35c73be', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-10', 'Passe',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '35b9c779-e8a6-4a6a-81d9-755fea924f3a', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-10', 'Tilmann',
    '01/01', 6.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4f504d3c-3c4e-45fb-a873-a299a9ad0e05', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-11', 'Vendinha',
    '01/01', 5.18
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '52149717-96e4-469a-9092-ccbd9290703d', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-12', 'Mafalda',
    '01/01', 16.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd3cdf671-33a6-4dbe-9f5b-7e2f338817a6', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-14', 'Mais Café',
    '01/01', 26.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f69b389a-e723-48aa-b0f1-c896de4ae7a6', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-14', 'Guesser',
    '01/01', 72.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9d85a06d-f46c-4fc0-b753-54c601c48f5f', uid, '44f07c6b-b0af-4565-bc8e-aab63b4fdec9', 4, 2026,
    '2026-03-15', 'Vicenza',
    '01/01', 139.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3ba8bb4a-3b52-422a-9341-7cbb3c7936b8', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2025-06-07', 'Shopee',
    '11/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4b0f9cdf-f30d-471e-960f-b85284125a59', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2025-07-08', 'Shopee',
    '10/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '831b78f9-585a-4d56-80cf-1c5bb99b1e2d', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2025-09-05', 'Nike',
    '08/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '452996f9-6b5a-4c18-84ae-5d162db76f63', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2025-12-05', 'Terabyte',
    '05/12', 50.25
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fa6adb0b-1112-480b-84e3-9d1da8ffcd41', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2025-12-05', 'Pichau',
    '05/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '02035ce9-a03c-4650-9c41-d599349e782e', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2026-12-01', 'Pay2All',
    '03/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8745553d-cc97-492e-b467-1f59427a0dfe', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2026-03-06', 'Chilli',
    '02/04', 52.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '89a4eac5-0a82-447f-aebb-6d1e488854ee', uid, '59edbf2e-e80b-4514-8b98-104da4bbf5c1', 5, 2026,
    '2026-03-06', 'Flor Nara',
    '02/02', 50.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6d2f33df-207e-4abe-a65b-3fdec3dc44e0', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2025-06-07', 'Shopee',
    '12/12', 64.76
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f5eea7c6-9383-45d5-ba13-a9901d18de9d', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2025-07-08', 'Shopee',
    '11/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd8caf4b2-bd4c-4835-9624-a7726ac57d09', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2025-09-05', 'Nike',
    '09/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bc380d88-409d-489e-bb76-e0396f693cfc', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2025-12-05', 'Terabyte',
    '06/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7ad77f0d-d2a8-4d69-810f-c30e9c58d8b5', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2025-12-05', 'Pichau',
    '06/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '35755bbb-1c61-4035-9b69-b0beb09ebca5', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2026-12-01', 'Pay2All',
    '04/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '781b3699-44f2-450a-8d38-c9af9b3b7cff', uid, 'ab743a7a-8c8c-4f52-820b-f5613021dcb2', 6, 2026,
    '2026-03-06', 'Chilli',
    '03/04', 52.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e2670f2d-e21d-45ab-a9ec-ab90c3d77bfd', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2025-07-08', 'Shopee',
    '12/12', 76.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ff7b991f-8473-4cc2-aaf5-a1a3c4ba6993', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2025-09-05', 'Nike',
    '10/10', 101.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '853b480e-4208-4501-96ac-0ec2b6bb5ae8', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2025-12-05', 'Terabyte',
    '07/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3eebed9d-47c8-459e-848d-0a957548606a', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2025-12-05', 'Pichau',
    '07/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a54230e1-8c3d-4352-92b0-a03af76af232', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2026-12-01', 'Pay2All',
    '05/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '36f46638-2fec-4777-9c54-ef0adf4daf4e', uid, 'e24f3f70-beca-40ab-9bc3-63de54653bda', 7, 2026,
    '2026-03-06', 'Chilli',
    '04/04', 52.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'eb14182b-5e81-4b78-aec4-2e4896a7b44d', uid, '38f4b567-90a5-4d7f-b511-6b8d06d23c4a', 8, 2026,
    '2025-12-05', 'Terabyte',
    '08/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a4c3ab59-13ec-4271-9655-016428ae5763', uid, '38f4b567-90a5-4d7f-b511-6b8d06d23c4a', 8, 2026,
    '2025-12-05', 'Pichau',
    '08/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f4cc0cc5-7a68-4b4f-83a3-695fa24aafa9', uid, '38f4b567-90a5-4d7f-b511-6b8d06d23c4a', 8, 2026,
    '2026-12-01', 'Pay2All',
    '06/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bcb6a138-a04a-46c6-99a2-65f301d96c18', uid, '19e8bbec-fab2-4285-a270-cca6b561ece6', 9, 2026,
    '2025-12-05', 'Terabyte',
    '09/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '40293c4b-1495-4cc0-8e41-3a5c2cd5f957', uid, '19e8bbec-fab2-4285-a270-cca6b561ece6', 9, 2026,
    '2025-12-05', 'Pichau',
    '09/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd113e0ea-7410-4d0a-ad0d-d178b8c2162e', uid, '19e8bbec-fab2-4285-a270-cca6b561ece6', 9, 2026,
    '2026-12-01', 'Pay2All',
    '07/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a0ef48d4-8829-4c3d-8783-b699a8276734', uid, '0a67a1ca-c1a2-4792-a728-55ab3af27d6e', 10, 2026,
    '2025-12-05', 'Terabyte',
    '10/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1958601f-e3df-427e-9e79-0e0ef9a207fa', uid, '0a67a1ca-c1a2-4792-a728-55ab3af27d6e', 10, 2026,
    '2025-12-05', 'Pichau',
    '10/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd906d459-f8eb-485e-944c-a643ddb0d7e4', uid, '0a67a1ca-c1a2-4792-a728-55ab3af27d6e', 10, 2026,
    '2026-12-01', 'Pay2All',
    '08/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fde418fc-17cf-4601-9ad9-22f90f5bc54a', uid, '25e98f6e-3459-42cc-a2b0-686a56a47476', 11, 2026,
    '2025-12-05', 'Terabyte',
    '11/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1827bc4a-558b-422b-a3bf-a4fbbbcdea74', uid, '25e98f6e-3459-42cc-a2b0-686a56a47476', 11, 2026,
    '2025-12-05', 'Pichau',
    '11/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b8d7d94e-2050-4b41-ac17-4d181655d2ed', uid, '25e98f6e-3459-42cc-a2b0-686a56a47476', 11, 2026,
    '2026-12-01', 'Pay2All',
    '09/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'bd84eb03-233a-4e9b-95f6-12e6e38ffd30', uid, 'd671c25a-808b-4c6a-9bd9-766233a3fe22', 12, 2026,
    '2025-12-05', 'Terabyte',
    '12/12', 50.26
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f8da446e-d51f-4f05-aec8-8f8c4c871975', uid, 'd671c25a-808b-4c6a-9bd9-766233a3fe22', 12, 2026,
    '2025-12-05', 'Pichau',
    '12/15', 98.83
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ee7ca648-5fb0-45cd-b645-e7c140ce540d', uid, 'd671c25a-808b-4c6a-9bd9-766233a3fe22', 12, 2026,
    '2026-12-01', 'Pay2All',
    '10/12', 98.33
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ba839b65-0474-4c2d-a463-3874d0fb89cc', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-04-08', 'Panini',
    '09/10', 47.88
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'caedbbd8-61d4-4a5e-a037-0e5b78a0c640', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-05-08', 'ML',
    '08/10', 58.87
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8b8c65dd-cd67-41e9-9f91-bfdd12d4f57d', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-08-03', 'Growth',
    '05/06', 72.53
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '39b12747-8c7b-43b7-a975-0b3c99b25c5b', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-11-07', 'Store',
    '02/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fae51b01-ed22-481b-94f5-69bca7b415eb', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-11-12', 'Switch',
    '02/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b2bb7ddb-8bb8-4a4a-95ba-30f7b8088b8a', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-11-03', 'Pichau',
    '02/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '72974347-47a3-41e6-b808-f040342ba2d8', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-02', 'Santana',
    '01/01', 28.58
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c9c45f48-d803-4aa4-ba6f-69fb55724098', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-03', 'ML',
    '01/01', 28.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '85db0904-34df-43d0-9d3a-667760a95fc2', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9f585b60-0dce-41de-8fd4-98a67c83310d', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-04', 'Amazon',
    '01/04', 61.71
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ac680dab-19f8-4c44-8d69-a374e1b5b2c2', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-04', 'Komprao',
    '01/01', 17.56
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'af5674f9-cf38-4bc6-ab6c-e1e386e5c256', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-04', 'Transtusa',
    '01/01', 10.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0eada0e6-d45f-4bbe-a285-14c713719580', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-05', '99',
    '01/01', 14.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '018afde4-4706-4e39-8569-881cd4e632cc', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-05', '99',
    '01/01', 31.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '87dc2be7-0ce8-4a90-8b6e-f6b084d75cd0', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-05', 'Guesser',
    '01/01', 84.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '18cc1cee-b513-4f2b-8475-a7e15b387fc3', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-07', 'Santana',
    '01/01', 42.63
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0c4ebd91-2537-4547-a5f1-5a7f3399b478', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-19', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '20476255-8af8-4b09-8bd1-1f81864b712e', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-10', 'Mafalda',
    '01/01', 16.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '397ad428-e070-4e28-9707-4b7df6ec4f90', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-08', 'Avatim',
    '01/03', 81.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '77d72e83-4f88-4504-a7f1-963f71993042', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-15', 'Multa Atraso',
    '01/01', 16.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '744d8dff-6f19-41ec-be9c-e574e4882066', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-08', 'Pop',
    '01/01', 9.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a6c1f529-5727-4566-a27e-66196da49de5', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-04', 'Amazon',
    '01/01', -84.64
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9415c4f1-5ef2-4537-94ff-1f368e9dcd1c', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2025-12-23', 'Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9fcb250a-85f9-49b8-b5ad-00f5ec6c9505', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2026-12-29', 'OFC',
    '01/01', 72.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b0951df6-9ea2-49c8-8089-307d5fe74f4b', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2026-01-01', 'Juros',
    '01/01', 0.28
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '18e7c882-cd67-4a3b-a7ac-6f659fbf7ec4', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2026-01-01', 'Juros',
    '01/01', 1.72
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f9e7389f-4675-4466-8d8e-70428706b88c', uid, '8b014714-45e3-4a34-9972-d1b90d0c71de', 1, 2026,
    '2026-01-01', 'IOF',
    '01/01', 3.25
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '55400632-2b0f-437c-b6ed-e59d9f8d7b46', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-04-08', 'Panini',
    '10/10', 47.88
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd2b5aad0-9aa8-4e1d-9923-16d2063cf313', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-05-08', 'ML',
    '09/10', 58.87
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b591b489-1763-4418-930a-1102b04459e2', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-08-03', 'Growth',
    '06/06', 72.53
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1ff09a93-7024-41c8-a202-3e17422806c6', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-11-07', 'Store',
    '03/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '18979c9b-eca6-4269-8a6d-61460e54c55c', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-11-12', 'Switch',
    '03/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7e788ac2-abc1-494e-ac09-6699978fea1d', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-11-03', 'Pichau',
    '03/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f95d2f99-264a-4fdf-9b96-0c1f9686bd5c', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f5d6abd2-2141-444e-9406-a224504362fb', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-12-04', 'Amazon',
    '02/04', 61.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'baa76a3a-28ec-4547-a9f8-475a1d39a44b', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2025-12-08', 'Avatim',
    '02/03', 81.66
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fb76562e-2010-4826-9278-f554bf318303', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', 'ML',
    '01/06', 43.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5b421d2a-3697-41bd-9353-86f78b1bff67', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', 'Vizinhao',
    '01/01', 17.95
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8cf799a3-a10a-457c-b066-d9de18384094', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', 'Verdureira',
    '01/01', 81.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e9e1f35c-dfa4-415d-b64a-2bbacadd8071', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', 'Drogaria',
    '01/01', 16.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8a163be9-efa8-4758-9cf5-d2f8368d2d85', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', '99',
    '01/01', 10.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0d95b90b-54bc-40a3-a839-d653c92e411c', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-04', 'Santana',
    '01/01', 55.15
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '40db213e-5686-49a6-a41f-ca8e7ab67d77', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-07', 'Uber',
    '01/01', 19.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4cb07245-a963-4361-ba38-ec098a31de8c', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-07', 'Uber',
    '01/01', 34.85
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'cfc668cb-0426-467f-b9fd-f51787193371', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-09', 'Pop',
    '01/01', 8.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd385d2e0-b917-43c5-bff6-0df096496ce1', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-09', 'Preço Popular',
    '01/01', 17.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '48128562-aa53-4c35-a36e-3ff57c1ff8e7', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-09', 'Pão da Vida',
    '01/01', 36.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f81119aa-70e4-4def-bf76-79ddbcc4c406', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-12', 'ML',
    '01/01', 32.38
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '98496358-22e7-43c1-88fa-1e7760f96891', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-12', 'ML',
    '01/01', 29.66
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5df33ce8-1f9a-47bf-8ebc-6f123a3976dc', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-13', 'Komprao',
    '01/01', 26.78
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f920c67b-d8d4-4351-9055-14bc82586aee', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-14', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '88019aa6-e1f1-4320-ac51-13354add5f6a', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-14', 'Garten',
    '01/01', 15.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6a54f019-e908-45cf-a1ce-80fda9410c47', uid, '6a8f7b3a-9630-4051-8fc3-f72160c25fb9', 2, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c74ae24f-cdbd-40b6-be6f-2c2fa16d23cc', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-05-08', 'ML',
    '10/10', 58.87
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3c7bb365-6817-49bc-9b93-4b7c4ae60b4e', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-11-07', 'Store',
    '04/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f9ecafbf-383f-4808-bf9a-f3dc3b0a9678', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-11-12', 'Switch',
    '04/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c89731b2-a8a9-47cd-a609-86f99f7d59ea', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-11-03', 'Pichau',
    '04/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f3629c74-19f9-44e0-9889-30c4bed61d59', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '31617b90-8cef-4e67-96ae-b44a85ab6d61', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-12-04', 'Amazon',
    '03/04', 61.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c08ce28a-3633-4c3b-8889-6154c5dfaa6d', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2025-12-08', 'Avatim',
    '03/03', 81.66
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '61f72790-b6ab-4fb2-95fe-c7f1ff6edbc7', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-01-04', 'ML',
    '02/06', 43.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c7eb9df6-1e1c-4ef6-98af-335cf265185b', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '73a1ee6d-4d17-43d7-9779-70304c2437d4', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-03', 'Olympikus',
    '01/03', 50.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '43ce2636-57cc-4409-947d-622207126a8c', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-03', 'Tillmann',
    '01/01', 12.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2636f22e-9b3e-4ebd-b38a-0e199665feeb', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-03', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a43cf0ee-496f-45de-a110-4aacd709a0c8', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-03', 'Uber',
    '01/01', 12.88
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '64ee9a10-3ed4-4c15-8a38-a59cab27185f', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-03', '99',
    '01/01', 27.96
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '690fec1a-f234-4b1e-be8d-e940f16f72ea', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-04', 'Santana',
    '01/01', 60.69
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '13d35960-6c52-4cce-ae1c-c987a63bf7a5', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-05', 'Jerke',
    '01/01', 71.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '99979c9e-cc92-4bd4-a7a3-d421d7a5f59b', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-05', 'Komprao',
    '01/01', 37.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'edb5b7ce-4996-46fc-a4a6-5af2c4851bd5', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-05', '99',
    '01/01', 20.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '132ead66-f478-4f72-b193-4da75bf1c78d', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-10', 'Uber',
    '01/01', 36.71
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6de46a7d-33a2-4ef8-b303-16059f20dca2', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-11', 'Uber',
    '01/01', 28.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0a87ef13-dd92-4715-8bda-8d931ae52c68', uid, 'ea63260a-9a24-4586-80a4-d9fa1567a4ea', 3, 2026,
    '2026-02-13', 'Mercado Livre',
    '01/03', 44.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9a59482b-1f39-40b8-941e-6b4e12a5046a', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2025-11-07', 'Store',
    '05/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f7fc95f1-82c8-4033-b9c8-683f28e62871', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2025-11-12', 'Switch',
    '05/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '969d4f33-9185-4a6a-9bd6-a8ede7e59c58', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2025-11-03', 'Pichau',
    '05/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7dfffffa-8ed0-426a-ae62-63a4cf59cc5b', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '67de29b1-0dac-434e-932b-40754be14079', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2025-12-04', 'Amazon',
    '04/04', 61.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c9cf3f43-c730-49d9-b814-1ba2b3a7b888', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-01-04', 'ML',
    '03/06', 43.31
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f06327a5-c202-43fa-9cd5-52f739283215', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '817b2a08-3766-49fe-8c65-0bf394d77720', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-02-03', 'Olympikus',
    '02/03', 49.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '97e611d5-f8c6-4b60-a516-6de678e03749', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-02-13', 'Mercado Livre',
    '02/03', 44.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '67613c64-d939-44fc-8772-9291cfb2f730', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-02', 'Amazon',
    '01/01', 9.95
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8974a090-ac56-4a07-8754-5b2fc33ac39a', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-02', 'Passe',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1c0c90c4-9440-41da-8f00-1d846e94a6e7', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-03', 'Cantina',
    '01/01', 40.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '43699d87-3025-43fc-804c-c5b460f11e7e', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-03', 'Komprao',
    '01/01', 30.17
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '87cfa7b8-5779-4c3c-8792-ef205b81d2df', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-03', 'MM',
    '01/01', 35.75
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9914e07f-bb4c-4aba-b3a3-52e808e00ed5', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-03', 'Passe',
    '01/01', 6.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '85264ffb-0cd5-45e1-a33a-4f6ea155750a', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-03', 'Amazon',
    '01/01', 20.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6475e613-3a8a-4685-9678-e70f96aeed95', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-04', 'Hora da Pizza',
    '01/01', 70.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e066e534-d8e5-4145-a2ca-a5b4b1efe875', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-04', 'Mercado Livre',
    '01/01', 61.92
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9a28f1ed-0e85-456b-bef6-4c05477c306b', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-06', 'Vitoria',
    '01/02', 50.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '727635bd-d218-4e64-a091-e82d016d0137', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-06', 'Rosangela',
    '01/01', 85.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ae376d9a-f115-4f2f-b7bd-018d32d69129', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-09', 'Shopee',
    '01/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1c6c4d46-df33-449e-87e6-f4ac38ba71ed', uid, '0db766c2-d25d-4ce6-9c4b-66ecaee1c2aa', 4, 2026,
    '2026-03-10', 'Lavih',
    '01/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b6e7c467-576a-4c51-928e-4b9d0acd228d', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2025-11-07', 'Store',
    '06/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a58d842-3ae4-4c9e-a2d4-8b1d7e57694e', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2025-11-12', 'Switch',
    '06/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1fd4ded0-d9e9-4757-bf73-5993996acef3', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2025-11-03', 'Pichau',
    '06/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'aa60ab7c-e063-447f-807f-c94822c500e5', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ed791250-47a6-4257-808e-2606fdc82ce1', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-01-04', 'ML',
    '04/06', 43.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7b319d89-e63e-4531-82bc-c44666138fe5', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '737edaa0-f87b-4e1b-883f-92ed7db7deaa', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-02-03', 'Olympikus',
    '03/03', 50.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '40902ef5-a500-4495-9609-9f5f59fd643d', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-02-13', 'Mercado Livre',
    '03/03', 44.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a8cb278-cb79-4cc3-8180-2cd974c46421', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-03-06', 'Vitoria',
    '02/02', 50.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c3571651-fdb5-4c72-ae8d-edf2c7435910', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-03-09', 'Shopee',
    '02/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2853274d-0d73-4278-93e6-97704c70c304', uid, '4dc68295-46f9-49f8-aa1e-1f6e0f4f1511', 5, 2026,
    '2026-03-10', 'Lavih',
    '02/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7d60473a-c34b-4a8d-bf3d-49610c2c4f35', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2025-11-07', 'Store',
    '07/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5d888a2a-2d74-49be-88be-72bf7c061e3c', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2025-11-12', 'Switch',
    '07/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5d6f77f3-b9f0-4906-b7d6-26031f45c699', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2025-11-03', 'Pichau',
    '07/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '75ecdd71-ffda-4a0d-8262-a0685dcb2c12', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd867d9d8-e41b-4f6f-ae55-a5743190934c', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2026-01-04', 'ML',
    '05/06', 43.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'da81774e-1e42-47a0-b4dc-e5371daeb0cd', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '147f4567-d388-4a08-b089-e6f1404de277', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2026-03-09', 'Shopee',
    '03/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '77a11890-24c4-428e-be43-fadb70237058', uid, 'adba37b6-58b7-4cca-9c2a-3c683a99333f', 6, 2026,
    '2026-03-10', 'Lavih',
    '03/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '710403aa-36f3-466e-a212-824bafd0c99d', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2025-11-07', 'Store',
    '08/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd2680929-b643-43f6-b5eb-e346a35159c5', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2025-11-12', 'Switch',
    '08/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '61871b69-368d-4236-91ca-353562c444eb', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2025-11-03', 'Pichau',
    '08/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dbc90e99-663f-449e-82b1-2df9132b26f8', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '52fb52f8-b665-4f4d-8264-e2cd7be65277', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2026-01-04', 'ML',
    '06/06', 43.35
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e25a1ccf-b1c9-4c3e-aeaf-c0f98f5ba1cf', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7b085c17-c443-44e5-a789-c41d7251e586', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2026-03-09', 'Shopee',
    '04/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c3906b16-43b0-4e2a-b4e5-2654f515e8d6', uid, '9c631ce9-f75f-46c0-80da-06ee2c5aa246', 7, 2026,
    '2026-03-10', 'Lavih',
    '04/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3c88c953-0dd5-46d0-b821-ab9bdeb085fe', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2025-11-07', 'Store',
    '09/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6a77628c-8c52-4f7f-accb-9e8aee7d4972', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2025-11-12', 'Switch',
    '09/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f323a076-b087-479e-b785-4d0021ae207a', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2025-11-03', 'Pichau',
    '09/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '26776c3b-25f6-465b-b27f-ad5d80dca98e', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1d7a5156-3c46-407c-a46a-ae1c8939c005', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '941f8fb7-1cde-4d51-bf71-6d7d43580146', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2026-03-09', 'Shopee',
    '05/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e6aa133c-95a1-474d-9b86-49a0189fe149', uid, 'bd4ec62e-2c30-4010-b01d-c5de2694fa9e', 8, 2026,
    '2026-03-10', 'Lavih',
    '05/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3cb9b1a6-49fe-4c54-b3ac-dce2f784f113', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2025-11-07', 'Store',
    '10/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '662f03d3-3f36-421d-b8e4-ff59cf4729ad', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2025-11-12', 'Switch',
    '10/10', 53.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f5c69325-3532-4265-8024-ccf315f3385b', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2025-11-03', 'Pichau',
    '10/10', 29.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0684de6a-9714-4201-a0d8-73da8742cbcb', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ba799985-0d9f-485e-a33c-304053cf7a44', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f89fd2f2-0aa2-493f-a9e0-49658fe6f0eb', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2026-03-09', 'Shopee',
    '06/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f08117f8-4eda-487a-b571-798adbff2a50', uid, 'ee95724c-6d2c-42ec-8586-a1afda917e90', 9, 2026,
    '2026-03-10', 'Lavih',
    '06/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f65f9693-a0b1-4ea3-a8a9-eafd3428d5fc', uid, '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', 10, 2026,
    '2025-11-07', 'Store',
    '11/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2d0a5334-e12c-47e7-bbb6-04426743c658', uid, '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', 10, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e85136a2-1afc-42b4-9259-f4fe8e0253fa', uid, '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', 10, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '04077eb6-b456-4d63-951c-bacfca913fcf', uid, '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', 10, 2026,
    '2026-03-09', 'Shopee',
    '07/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b4789772-807e-4fc9-a598-51cccabe2562', uid, '1b19bfe4-13bd-4f9a-a1ea-aa6cf77229df', 10, 2026,
    '2026-03-10', 'Lavih',
    '07/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9ad64a5c-311d-497e-aa4a-50321e28968f', uid, 'c53e790b-d12e-4840-b8b5-d40b61ad27e8', 11, 2026,
    '2025-11-07', 'Store',
    '12/12', 30.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd520a415-f761-4757-9752-5796ad488cea', uid, 'c53e790b-d12e-4840-b8b5-d40b61ad27e8', 11, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3061c477-253a-4ef4-bd12-45feb2006ea0', uid, 'c53e790b-d12e-4840-b8b5-d40b61ad27e8', 11, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '032f9742-d5f4-40f5-878f-2fb4d299487b', uid, 'c53e790b-d12e-4840-b8b5-d40b61ad27e8', 11, 2026,
    '2026-03-09', 'Shopee',
    '08/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6a037ccf-d06b-4638-b311-440019427ada', uid, 'c53e790b-d12e-4840-b8b5-d40b61ad27e8', 11, 2026,
    '2026-03-10', 'Lavih',
    '08/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4ea73e71-1886-4412-8587-7898c604ae91', uid, '552bd2c4-e76d-42d4-9926-ed4b841e9867', 12, 2026,
    '2025-12-04', 'Netflix',
    '01/01', 20.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3e4c9499-58e3-49af-9ff8-c34bf6ea953e', uid, '552bd2c4-e76d-42d4-9926-ed4b841e9867', 12, 2026,
    '2026-01-23', 'HBO Max',
    '01/01', 18.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '48b54299-9cf4-442d-af2d-eb781aa6be50', uid, '552bd2c4-e76d-42d4-9926-ed4b841e9867', 12, 2026,
    '2026-03-09', 'Shopee',
    '09/12', 42.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b7ba1fa9-27da-4108-93e0-f9e91f435ea5', uid, '552bd2c4-e76d-42d4-9926-ed4b841e9867', 12, 2026,
    '2026-03-10', 'Lavih',
    '09/10', 36.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dc6aaccc-11d6-4998-8d52-73c508dbc846', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2024-10-21', 'Meli',
    '01/01', 9.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a244c9d4-ffb6-4e7c-8419-dc690703f273', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f708ec0f-a9c6-4ad3-b01d-71ac5d9a932e', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-04-04', 'ML',
    '10/10', 17.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a5b9690-cff4-4640-a8d9-7775672b9ecf', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-05-15', 'ML',
    '08/12', 44.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2ea21b5f-2969-4815-baa8-dafcd24939c3', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-11-16', 'Boldies',
    '02/03', 55.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0e1ed8f9-5c10-4ec9-840a-91bdd1cb2f66', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-11-28', 'ML',
    '02/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1a5f6c0a-7232-4456-b332-2859d704d14b', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-16', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9178c385-4d55-458e-a067-ccc3a7d7f9ce', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-16', 'ML',
    '01/05', 15.01
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '81f7c948-fb9f-4158-b9af-b5e21939fba5', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-16', 'Gasolina',
    '01/01', 160.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '460f12db-304d-46ce-9e8e-a06f8b09b45a', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-16', 'Santana',
    '01/01', 24.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '04da77b2-2c12-4428-b76c-d20cd7c05eeb', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-17', 'Santana',
    '01/01', 75.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4fcaa5ca-3f00-46e0-9db1-76707b5596a4', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-18', 'Nuuvem',
    '01/03', 28.28
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '7a4aaf6a-d348-4037-b82f-5f3914c67688', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-19', 'Transtusa',
    '01/01', 10.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '53e3b05e-0db0-4ec0-80d3-56c15be3281f', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-19', 'Mafalda',
    '01/01', 16.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '354b3228-236c-4437-9fa1-57bb2ec66421', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-19', 'Mercado Livre',
    '01/08', 32.54
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ccf98819-aede-4575-bf75-e93a9f37415f', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-20', 'Koch',
    '01/01', 64.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0ecac7a3-b886-4c88-b7f5-afe9ba6b427b', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-21', 'Santana',
    '01/01', 53.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '930c6544-ffd7-4514-a479-63bb85c6db5b', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-22', 'Drogaria',
    '01/01', 15.7
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e35381ec-b2dd-4ebf-ba19-314eb630e432', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-22', 'Jeze',
    '01/01', 40.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b4246a0a-5656-4ff7-99af-880127df30d5', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-22', '99',
    '01/01', 13.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c1b552ab-56c1-46d8-b82b-354a7b37b3ac', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-23', 'ML',
    '01/05', 66.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1470fe9c-cac0-4e7e-b377-03e730e9e175', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2025-12-23', 'ML',
    '01/01', 62.87
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0a6cb181-e320-48ac-b65d-6289eda3bf5c', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2026-12-30', 'ML',
    '01/02', 38.62
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3c42c84e-b788-4437-9f63-b78c31ae3196', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2026-01-07', 'Devolução',
    '01/01', -62.87
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9cffed07-83ae-4bec-9b8f-a7d8612b158e', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2026-01-10', 'ML',
    '01/03', 39.39
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dcce46b6-d79a-47e6-8d8c-b93507124d84', uid, '011d0d5e-4a32-4541-baa4-a980e07f1514', 1, 2026,
    '2026-01-14', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '18847950-8800-4570-8568-410a37cb642b', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6110eb6c-718b-4141-9dba-8f8e64b0cdd4', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f5d3aa41-f7da-4894-9961-1058422a3a53', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-05-15', 'ML',
    '09/12', 44.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1406ae54-db2a-4942-8592-e9aea91ce96c', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-11-28', 'ML',
    '03/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e87675bd-b888-445f-b4e5-7dc97414abb9', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-12-16', 'ML',
    '02/05', 14.97
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'df267613-9141-4a46-b71e-39b145747927', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-12-18', 'Nuuvem',
    '02/03', 28.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '14b9ad4f-3878-410f-8c7c-ec453bd78c1b', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-12-19', 'Mercado Livre',
    '02/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2407f365-a231-48b3-b3db-975719efae2f', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2025-12-23', 'ML',
    '02/05', 66.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '823fcbd8-6a4b-4107-8212-59dc1f427584', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-12-30', 'ML',
    '02/02', 38.61
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '28a01d87-a402-42b7-9179-1a8859a79fce', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-10', 'ML',
    '02/03', 39.38
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3fe844ff-487d-4338-abeb-eecc65026f2e', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-16', 'Uber',
    '01/01', 26.86
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'afca7df6-fc6f-4e8b-829e-165490a6f452', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-16', 'Giassi',
    '01/01', 8.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '52fa3cea-4251-410a-90d0-3f9d51d9f347', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-17', '99',
    '01/01', 9.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3188b2a4-cc63-4d2b-b5d1-fc318fa519b3', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-17', '99',
    '01/01', 10.1
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '129a7fe2-6700-4bcb-97ed-a628996297ed', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-17', '99',
    '01/01', 12.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '444c4aaf-6588-4fba-8f4d-f0d4d55ef20a', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-19', '99',
    '01/01', 20.5
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd3c9c072-80ea-4ce8-969a-33efd783992b', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-19', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '98a45bc7-7d2a-41b1-a4e0-bc5b5e7e1581', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-20', '99',
    '01/01', 12.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '070bbdd9-3258-4895-a6ca-faf03b2e684f', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-20', '99',
    '01/01', 12.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b9ff73e9-1626-4b63-860f-582fbea90469', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-21', 'Mafalda',
    '01/01', 15.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '287ecaf1-1ea1-4d99-98bd-74a4d3b75be6', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-21', 'Uber',
    '01/01', 24.69
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5dbf4d59-9e2d-4c98-bb35-f08229b2364c', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-22', 'Uber',
    '01/01', 29.22
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '36e757c1-2aa1-45c8-9b58-2571d39c4eab', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-22', 'Adelcio',
    '01/01', 29.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b6ccad38-1345-4139-b596-f7145660776c', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-22', '99',
    '01/01', 14.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '681e3fbd-3907-4297-88b1-c6f0215e77ef', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-22', 'Uber',
    '01/01', 13.72
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4019349b-0c75-4346-a7d7-d5b832de6419', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-26', 'Uber',
    '01/01', 16.65
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '213fc261-4ee5-47a8-961a-05391a489463', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-29', 'Uber',
    '01/01', 11.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6f731c66-7424-47e5-8687-8ef3b3700033', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-29', 'Natalino',
    '01/01', 67.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '566bb5a6-7466-4cfc-952f-c6717fec553c', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-30', '99',
    '01/01', 19.2
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1171548d-f208-4da2-ada4-d739d80e4277', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-30', 'Transtusa',
    '01/01', 20.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '348412eb-85c7-4c89-8943-15c48436fe2a', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-01-30', 'Uber',
    '01/01', 11.68
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '00afab3a-c9f2-404d-9a7f-d4d5d6c008de', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-02-01', 'ML',
    '01/04', 53.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a42ca489-a928-42ba-b46a-67551ae1db4b', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-02-02', 'ML',
    '01/05', 9.62
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f992a00d-0fba-4e72-9d08-3f6c2c92e300', uid, '68b23554-1456-49be-af96-9826790d1930', 2, 2026,
    '2026-02-02', 'ML',
    '03/03', 55.41
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c95b7c83-69d2-458e-9ecc-536c3ece381e', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2f57d787-b8c0-407c-a238-d1d25b98dd06', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a1a04b5c-b739-42c1-a194-1e0c85aa168e', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-05-15', 'ML',
    '10/12', 44.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '07e0b7e2-9a1a-47ae-b974-f750256ded57', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-11-28', 'ML',
    '04/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '22b6d174-6947-461e-9d8a-239ba9bee9a2', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-12-16', 'ML',
    '03/05', 14.97
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c6d6568d-7926-402f-b040-9eaa86d81943', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-12-18', 'Nuuvem',
    '03/03', 28.27
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '25f682e7-536a-470f-86f1-49d87de5c45f', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-12-19', 'Mercado Livre',
    '03/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4a30c1af-21ce-4f2a-84d7-bc7b2dd6ce32', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2025-12-23', 'ML',
    '03/05', 66.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4eda1a46-c04d-4706-9003-09da828fb74e', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-01-10', 'ML',
    '03/03', 39.38
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ff770a80-7aa6-419f-a80c-6d142b94fbde', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-01', 'ML',
    '02/04', 53.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ff6ed87e-fffb-42d0-9933-3233005d8c4c', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-02', 'ML',
    '02/05', 9.58
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd499ea13-a59c-4599-958a-0485a4ccba79', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-16', 'Uber',
    '01/01', 20.95
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd2885eab-d543-4b39-8489-b909c5093d36', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-16', 'ML',
    '01/10', 49.45
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dbfc062d-993e-4f7e-b8d1-80de1e881322', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-16', 'ML',
    '01/08', 32.54
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1c097090-815e-446a-b055-842535576671', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-16', 'Pao da Vida',
    '01/01', 54.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2c796d21-558d-41ef-b0b3-678b07af0573', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-25', 'ML',
    '01/07', 24.02
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '485cfee1-528c-4a5a-a82d-f7d89e5f1ab6', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-26', 'Cacau Show',
    '01/01', 64.97
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2c5a95b1-ae44-408d-9804-21429b8f0437', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-26', 'Pao da Vida',
    '01/01', 45.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ad3acdac-d5f0-44c0-b154-a2009bb007bf', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-26', 'Mafalda',
    '01/01', 15.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '67d8e9fb-a80d-4266-aea3-11c79315b83e', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-02-27', 'Drogaria',
    '01/06', 43.17
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f9be9139-433b-4729-bcac-686fcede7f39', uid, '747a795c-f54d-4a29-9f92-ca3f5780ff21', 3, 2026,
    '2026-01-01', 'Santana',
    '01/01', 63.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f35db189-c129-48c8-8388-a35080ef998d', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '33e740d3-ddf1-4672-ae16-dc275ecdd4b3', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd689377e-6c68-46ea-b920-339175d82480', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-05-15', 'ML',
    '11/12', 44.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e508f230-1c5a-4798-9122-2a797f2aae0b', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-11-28', 'ML',
    '05/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '814ca072-5995-4ccf-962f-700cd1752c50', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-12-16', 'ML',
    '04/05', 14.97
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'dcc3ca66-861c-4f44-a0eb-82eec5d06ff9', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-12-19', 'Mercado Livre',
    '04/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f4bbdba1-a060-400e-b645-63363287a3c5', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2025-12-23', 'ML',
    '04/05', 66.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '31425e91-dac5-4752-b6f4-15f712caaa76', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-01', 'ML',
    '03/04', 53.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c38cd51a-fcb8-43c9-8efe-8293977daabd', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-02', 'ML',
    '03/05', 9.58
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '72556ba7-8128-43b9-b633-76d308efb946', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-16', 'ML',
    '02/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a42d9739-54b2-46c4-a936-06c36546baad', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-16', 'ML',
    '02/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f80bec9a-fdaf-4c9b-94c8-b9b330f4ac16', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-25', 'ML',
    '02/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2e8b2a50-8510-4653-a259-b889df3f8e1a', uid, '9c85da4a-67a1-4fdf-8b8d-fd333c53de39', 4, 2026,
    '2026-02-27', 'Drogaria',
    '02/06', 43.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '20109884-de9a-4683-9370-46a2787a2eb0', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9a8d2991-d858-4e6c-9a5f-d40220cf3c32', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3bf2c792-52c0-4ae1-8988-0f818e0b0721', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-05-15', 'ML',
    '12/12', 44.37
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fd43a5c5-82ea-45d4-887b-2ebe86984b7e', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-11-28', 'ML',
    '06/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3ee9ac6d-4d1e-4d28-9cdc-c5d354c26682', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-12-16', 'ML',
    '05/05', 14.97
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '1409ea02-b630-4d8c-9c05-26c3ad2838e4', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-12-19', 'Mercado Livre',
    '05/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'a451b914-7f60-4327-b8f0-b08ae18799cf', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2025-12-23', 'ML',
    '05/05', 66.47
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd6c9e0ab-64ae-44f6-b9ff-7a1fc7107771', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-01', 'ML',
    '04/04', 53.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '570717f5-0359-4d30-b91e-91f326f7d8da', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-02', 'ML',
    '04/05', 9.58
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2d772519-eb79-4b48-9766-32faacd5f3db', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-16', 'ML',
    '03/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8cff459c-b7ce-486b-a03e-f0d2ea91ec40', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-16', 'ML',
    '03/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'afe57ac4-2601-4401-9ade-bb66fcf4b814', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-25', 'ML',
    '03/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '831b005b-8d6d-48d6-a0aa-014cedf84de8', uid, 'df81ebaf-c40c-4521-9360-750f9e365168', 5, 2026,
    '2026-02-27', 'Drogaria',
    '03/06', 43.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9d9af368-b758-4220-97ed-40550a5f76cf', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0c04f168-492d-490f-8df3-aeaefc40c635', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ecdb0d5a-7281-4716-80ae-7c03d9e16299', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2025-11-28', 'ML',
    '07/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4058e07d-bd65-484c-beb2-45eec481eaa7', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2025-12-19', 'Mercado Livre',
    '06/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0c816ada-b51e-43ce-8817-7fac8c797d29', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2026-02-02', 'ML',
    '05/05', 9.58
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2ac9500b-3509-4ea6-bfbb-898e38791661', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2026-02-16', 'ML',
    '04/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4df6d294-6e57-468d-855a-0bcb397171ca', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2026-02-16', 'ML',
    '04/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd7107dcd-9f63-43cc-a9cb-806400dab6d2', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2026-02-25', 'ML',
    '04/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3e178bdd-d061-47dc-8863-8647d054035a', uid, 'f3ad0be3-ed27-408e-bca1-0771982a5719', 6, 2026,
    '2026-02-27', 'Drogaria',
    '04/06', 43.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'faec98ee-5955-4cd0-b71d-f25eb963ba71', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e7a95c6e-82c0-4791-b1e1-1ce2c941ed25', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ae667898-ea83-4582-b719-a72a828dc289', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2025-11-28', 'ML',
    '08/08', 23.73
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '79335cad-c372-46a0-95c6-1954010575cd', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2025-12-19', 'Mercado Livre',
    '07/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '0534de78-5352-4599-aa21-71d21c6cca22', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2026-02-16', 'ML',
    '05/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8b418733-618f-4ece-9229-9ef40789c77e', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2026-02-16', 'ML',
    '05/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '17bbaa5a-ffcf-46d9-9780-56cd04346898', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2026-02-25', 'ML',
    '05/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '874f6a18-d3d7-43fe-85b7-f8d5de255fb6', uid, 'a170cf48-5d67-40e4-adae-dc5735e170fe', 7, 2026,
    '2026-02-27', 'Drogaria',
    '05/06', 43.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f251a9ab-d2b8-45e4-80b7-0ff822d6fd83', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '45af3e3b-6049-42a6-b218-a0411a4c0b9d', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '11c8bd2b-3006-4923-ac6f-107b00df29e0', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2025-12-19', 'Mercado Livre',
    '08/08', 32.48
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '3730d1e3-359d-4da6-a7de-d05f88d1f162', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2026-02-16', 'ML',
    '06/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f6199d20-6fe8-46ee-a14f-bd36e594cea3', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2026-02-16', 'ML',
    '06/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ef9b62a1-58fd-48c9-8187-5967a89907b9', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2026-02-25', 'ML',
    '06/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '5187c4fe-5280-4b16-8298-4a757b4eed60', uid, 'db0cb23d-678b-463c-b709-a44a9d124528', 8, 2026,
    '2026-02-27', 'Drogaria',
    '06/06', 43.13
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '997e755f-c27b-4ac7-b2a3-1fb2ecc4da11', uid, '77fd04b2-f9e6-4c51-96a5-541bce89cca4', 9, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b7f24cac-9288-4011-98ce-22646c806f25', uid, '77fd04b2-f9e6-4c51-96a5-541bce89cca4', 9, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '282fbfd5-071a-4d03-b9b3-23b27493c3d3', uid, '77fd04b2-f9e6-4c51-96a5-541bce89cca4', 9, 2026,
    '2026-02-16', 'ML',
    '07/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '683c4e7a-ccb2-472b-b88c-3a6a85b4f716', uid, '77fd04b2-f9e6-4c51-96a5-541bce89cca4', 9, 2026,
    '2026-02-16', 'ML',
    '07/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8905c5c9-aa85-422b-a2e0-7af2a939723c', uid, '77fd04b2-f9e6-4c51-96a5-541bce89cca4', 9, 2026,
    '2026-02-25', 'ML',
    '07/07', 23.98
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '65ee313f-4332-4d44-84b9-b4ff29d23fd1', uid, '240f978e-7c23-4181-a527-c9c42393340c', 10, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'afb2781f-40aa-4f85-8f6f-7d74b1828b8c', uid, '240f978e-7c23-4181-a527-c9c42393340c', 10, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ba0ee8db-b50b-44d4-b2af-cf53b5e091d6', uid, '240f978e-7c23-4181-a527-c9c42393340c', 10, 2026,
    '2026-02-16', 'ML',
    '08/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '60cc6261-c7a3-47f7-8044-1dd5f5e51764', uid, '240f978e-7c23-4181-a527-c9c42393340c', 10, 2026,
    '2026-02-16', 'ML',
    '08/08', 32.49
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'decbf004-b767-46b4-b908-16cff599bdd2', uid, '90b32fb6-9b7a-4f39-8a9c-41d0be8d8df9', 11, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'f1f3cd59-1cf9-4784-be55-5184c6a7e56b', uid, '90b32fb6-9b7a-4f39-8a9c-41d0be8d8df9', 11, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '938ee53e-704b-43d0-9ea8-f239d5255df0', uid, '90b32fb6-9b7a-4f39-8a9c-41d0be8d8df9', 11, 2026,
    '2026-02-16', 'ML',
    '09/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e5a12c25-09d0-4b4f-9bfb-ab92535cc2ba', uid, 'c119da38-4143-4a88-ba70-bb715c97e5e4', 12, 2026,
    '2024-10-21', 'Meli',
    '01/01', 19.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'b5b8de38-9be3-48ee-b79c-9cc0a868543d', uid, 'c119da38-4143-4a88-ba70-bb715c97e5e4', 12, 2026,
    '2025-04-01', 'Youtube',
    '01/01', 24.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'fb838e5e-48fc-463a-8a21-4733cbab4e4a', uid, 'c119da38-4143-4a88-ba70-bb715c97e5e4', 12, 2026,
    '2026-02-16', 'ML',
    '10/10', 49.4
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e125e491-7a99-42e6-b469-1f9cf295e14b', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2025-11-29', 'Pernambucanas',
    '02/05', 93.18
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8533896e-d5e6-492f-9ec4-dc4fe8f13b3a', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2025-11-29', 'Rochelli',
    '02/03', 53.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'd94efb6f-a875-4f6d-8347-8a3f4c7dba1e', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2026-12-26', 'Bocão Lanches',
    '01/01', 42.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8940f065-3a52-4863-95de-b3a3c4d59eba', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2026-12-24', 'BK',
    '01/01', 83.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '71a30b35-f759-4ced-8614-3228105bcd92', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2026-12-22', 'Cacau Show',
    '01/01', 19.99
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8192b1e3-10b5-4917-93a6-912b4bdb3388', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2026-12-19', 'TCG Alimentos',
    '01/01', 21.8
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '08d5045f-bb99-4d30-9d23-7cd065efdf6f', uid, '908e0d9d-addb-4f4d-b467-5ca1ba545daa', 1, 2026,
    '2026-12-18', 'Calzoon',
    '01/01', 17.9
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2aeedc00-d561-4a6e-a029-e54df8e5b8a8', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2025-11-29', 'Pernambucanas',
    '03/05', 93.18
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '4ec99825-663f-4230-8eec-81b6c3cb4c16', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2025-11-29', 'Rochelli',
    '03/03', 53.3
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'ae257ebb-5819-47f1-86a9-09f6015bead5', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2026-01-30', 'Ney (T.B.I)',
    '01/05', 136.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8b349f66-6e0a-4fe6-bf78-14f5e88cc15f', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2026-01-31', 'Barbearia',
    '01/01', 45.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'e11229c3-26bc-43c1-b8b7-5dada16a8dad', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2026-01-31', 'Alpha Mix (Alex Pres)',
    '01/03', 56.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '9758530f-0432-4bea-b34d-541aec6b7885', uid, '90bf531e-0b2b-4534-b920-0a48b698fba3', 2, 2026,
    '2026-01-31', 'Gasolina',
    '01/01', 170.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    'c8d1309f-b47e-4892-8ea2-0b9726f2a5bc', uid, '1feab0ad-2714-4c7d-b119-46bfa88ad040', 3, 2026,
    '2025-11-29', 'Pernambucanas',
    '04/05', 93.22
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '012b9dc1-f551-436e-9cbd-92327c47eb89', uid, '1feab0ad-2714-4c7d-b119-46bfa88ad040', 3, 2026,
    '2026-01-30', 'Ney (T.B.I)',
    '02/05', 136.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '67041fbc-e5c4-44ee-bc20-203cc763d708', uid, '1feab0ad-2714-4c7d-b119-46bfa88ad040', 3, 2026,
    '2026-01-31', 'Alpha Mix (Alex Pres)',
    '02/03', 56.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '8d4ed073-13c8-4a69-85f3-86369283c374', uid, 'e0b9a5ba-4078-46d9-9c27-975dcf1feb89', 4, 2026,
    '2025-11-29', 'Pernambucanas',
    '05/05', 93.22
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '15be9124-1c8a-44c1-8ff2-b6e42b1e9ddf', uid, 'e0b9a5ba-4078-46d9-9c27-975dcf1feb89', 4, 2026,
    '2026-01-30', 'Ney (T.B.I)',
    '03/05', 136.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '331538d9-cd92-478f-9bf5-0188c3ef8a44', uid, 'e0b9a5ba-4078-46d9-9c27-975dcf1feb89', 4, 2026,
    '2026-01-31', 'Alpha Mix (Alex Pres)',
    '03/03', 56.6
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '6c15d951-bd46-42a1-9f3b-4b1e57bbc36d', uid, '3f7abc16-1815-406b-a490-5a2dc17edae6', 5, 2026,
    '2026-01-30', 'Ney (T.B.I)',
    '04/05', 136.0
  );
  INSERT INTO lancamentos_cartao (id, user_id, cartao_id, mes, ano, data_compra, local, parcela, valor) VALUES (
    '2a0b6892-ac2a-4776-a293-b4e6affea55e', uid, '8844f1f5-3a8f-45eb-90eb-8dffaca14b9d', 6, 2026,
    '2026-01-30', 'Ney (T.B.I)',
    '05/05', 136.0
  );

  -- ============================================================
  -- CONTAS FIXAS
  -- ============================================================
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '5ee4e259-222d-4328-b839-6a10a27bdda1', uid, 1, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2025-01-15', 450.97,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'd261eb14-0702-41ce-882a-33ef0f88563a', uid, 1, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2025-01-24', 396.99,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'f87b2b0a-8203-494c-b6a2-28d932c2f54f', uid, 1, 2026,
    'Contas Fixas de Casa', 'IPTU 2025',
    '2025-01-09', 35.74,
    TRUE, '1 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'ee4cfb79-caf6-4e2d-bf6f-2d988fead4cf', uid, 1, 2026,
    'Contas Fixas de Casa', 'Ambiental 2025',
    '2025-01-11', 20.49,
    TRUE, '12 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '9ba799aa-4c90-4204-b761-b17c07e3956f', uid, 1, 2026,
    'Contas Fixas de Casa', 'Ultra',
    '2025-01-11', 149.9,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '2b8b2a8f-428f-4744-9563-6e965c66796b', uid, 1, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2025-01-20', 49.62,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'c0612adc-9f62-429c-8075-1335242e525c', uid, 1, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2025-01-20', 55.34,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'f7028faf-d3e3-423b-83db-b6ed04e088af', uid, 1, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2475.78,
    TRUE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '7a21f6d1-6dd8-44dd-86a4-c6bda54479b0', uid, 1, 2026,
    'Vestuário', 'Renner',
    '2025-01-13', 61.94,
    TRUE, '01 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'a9e006d6-5ae2-46af-963d-867a688fe360', uid, 1, 2026,
    'Dentista', 'Dentista Thiago',
    '2025-01-01', 100.0,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'd7c1d652-09d1-419d-97e0-2d5e8297d866', uid, 1, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2025-01-01', 640.0,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '3162fce3-fde3-4c81-9e27-86b43b147ef8', uid, 2, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2025-02-15', 530.24,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '7d282133-854c-4aa0-ac84-25415b12f02d', uid, 2, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2025-02-24', 313.55,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '50c03428-27f9-4314-b79a-d9af634da4f2', uid, 2, 2026,
    'Contas Fixas de Casa', 'IPTU 2026',
    '2025-02-07', 35.74,
    TRUE, '02 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'a0750916-6441-48b1-ab2c-eae2b3e9c96f', uid, 2, 2026,
    'Contas Fixas de Casa', 'Ambiental 2026',
    '2025-02-11', 21.54,
    TRUE, '02 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '6495e158-03e8-462b-a571-acce5129a575', uid, 2, 2026,
    'Contas Fixas de Casa', 'Atêle',
    '2025-02-11', 149.9,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '16e61a91-ed64-4068-8361-22eeb67cf2be', uid, 2, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2025-02-20', 54.91,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '34a95087-84c0-4a67-a1fa-0c10b5b1fbdc', uid, 2, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2025-02-20', 55.28,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'b1ffb41e-4b82-4e0a-8f56-47a547c41d3d', uid, 2, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2321.0,
    TRUE, '02 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '286a85fb-cfef-45db-9785-bf005dfe278b', uid, 2, 2026,
    'Escola e Faculdade', 'Alimentação Yan',
    NULL, 194.0,
    TRUE, '02 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '879cd19e-ebbb-48c3-97c6-8347d713b8a4', uid, 2, 2026,
    'Vestuário', 'Renner',
    '2025-02-04', 95.54,
    TRUE, '03 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'ba81a9b7-b814-4db4-8570-35ed3b1cad7c', uid, 2, 2026,
    'Vestuário', 'Renner',
    '2025-02-13', 61.92,
    TRUE, '03 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '2dd759f7-a69c-4939-9998-dd180419e65c', uid, 2, 2026,
    'Dentista', 'Dentista Thiago',
    '2025-02-01', 100.0,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '8a791307-b3e6-4472-8b15-11b954773812', uid, 2, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2025-02-01', 660.0,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '01af42f5-e360-451b-ac57-7e077f84176f', uid, 2, 2026,
    'Juros Bancários Conta', 'Juros',
    '2025-02-01', 2.6,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '92176649-3a98-4760-8877-d0e52cc97cfc', uid, 2, 2026,
    'Juros Bancários Conta', 'IOC',
    '2025-02-01', 2.77,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '94bcb27c-d796-4565-8ce9-9eac5b56003c', uid, 3, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2026-03-15', 687.42,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '54657a96-1333-451c-a8a7-8d2e0e1ee176', uid, 3, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2026-03-24', 354.63,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '3ab9fe55-9839-4e05-b819-f95e782f6323', uid, 3, 2026,
    'Contas Fixas de Casa', 'IPTU 2026',
    '2026-03-07', 35.74,
    TRUE, '03 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'd61b6fa3-76e9-4103-b3ea-7bb79dfab092', uid, 3, 2026,
    'Contas Fixas de Casa', 'Ambiental 2026',
    '2026-03-11', 20.49,
    TRUE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '0d658d9f-2322-48a9-bba9-cc9a1652c08a', uid, 3, 2026,
    'Contas Fixas de Casa', 'Atêle',
    '2026-03-11', 149.9,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '9c9aba39-bad3-4d2c-b41c-e487260d9bcd', uid, 3, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2026-03-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '7773f853-6da5-4113-8842-67effb9bada0', uid, 3, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2026-03-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '81d0c2a5-e46a-40fb-bd7d-62c8e6252034', uid, 3, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2321.0,
    TRUE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '83f935a9-6460-4e46-8dfc-348bb9f74921', uid, 3, 2026,
    'Escola e Faculdade', 'Alimentação Yan',
    NULL, 194.0,
    TRUE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '8ab0e04a-233c-4763-ac4f-15558d94c6b1', uid, 3, 2026,
    'Vestuário', 'Renner',
    '2026-03-04', 91.9,
    TRUE, '02 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '013f82d8-936b-4cf0-8703-2971f77715c6', uid, 3, 2026,
    'Vestuário', 'Renner',
    '2026-03-13', 61.94,
    TRUE, '02 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '39f7ba3b-46df-49de-a8a6-06956df4212e', uid, 3, 2026,
    'Dentista', 'Dentista Thiago',
    '2026-03-01', 100.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '72418515-e58d-4ab8-b629-4651d5a272f4', uid, 3, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2026-03-01', 650.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '03c12d95-bfd7-434e-926f-52a63a2b84f3', uid, 3, 2026,
    'Juros Bancários Conta', 'Juros',
    '2026-03-01', -1.37,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '15ab75e1-c357-416f-ade0-f331674b0ddd', uid, 3, 2026,
    'Juros Bancários Conta', 'IOF',
    '2026-03-01', -0.43,
    TRUE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '77a60931-3408-4fee-9f1b-f7849bb19abf', uid, 4, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2026-04-15', 544.73,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '098f3dd1-50da-4f4f-8482-ac37c0e914fa', uid, 4, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2026-04-24', 254.26,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '9812da76-e3fa-4da0-aed0-dd0e075529ed', uid, 4, 2026,
    'Contas Fixas de Casa', 'IPTU 2026',
    '2026-04-07', 35.74,
    FALSE, '03 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '829a1352-a789-4dc2-8376-560c3becde82', uid, 4, 2026,
    'Contas Fixas de Casa', 'Ambiental 2026',
    '2026-04-11', 20.49,
    FALSE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '9bbf469e-3158-4c83-b4b9-88ddf4c57328', uid, 4, 2026,
    'Contas Fixas de Casa', 'Atêle',
    '2026-04-11', 149.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '6789f3e8-17a1-418d-acbc-a983f239f95e', uid, 4, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2026-04-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'd01303d1-b138-4fe3-8658-c3c771a52f08', uid, 4, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2026-04-20', 49.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'fa698415-a2d6-4518-b42d-3a817875ee5d', uid, 4, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2321.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '4c732145-d823-4d6d-a2e3-e182c52dd27f', uid, 4, 2026,
    'Escola e Faculdade', 'Alimentação Yan',
    NULL, 194.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'f3c772e9-e925-41d3-bcdf-7513b3a0fe69', uid, 4, 2026,
    'Vestuário', 'Renner',
    '2026-04-04', 92.1,
    FALSE, '03 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '5e33095a-88b5-433a-b33f-5376fd2bb9be', uid, 4, 2026,
    'Vestuário', 'Renner',
    '2026-04-13', 61.94,
    FALSE, '03 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '6849ae33-261b-41d3-b184-d787414c36cf', uid, 4, 2026,
    'Dentista', 'Dentista Thiago',
    '2026-04-01', 100.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'b741fa55-6b62-4dde-b9ea-a54952a407e1', uid, 4, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2026-04-01', 650.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '2843d9ad-db55-4ad3-a72f-369f2628ed2d', uid, 5, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2026-05-15', 544.73,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '2000c100-aec3-4bfd-a932-a51b9fb8e98c', uid, 5, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2026-05-24', 254.26,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '0022bd68-750d-47ae-b02c-2966be1ec49c', uid, 5, 2026,
    'Contas Fixas de Casa', 'IPTU 2026',
    '2026-05-07', 35.74,
    FALSE, '03 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'de7d7fab-4d4a-49a0-811c-53e233f5f0dc', uid, 5, 2026,
    'Contas Fixas de Casa', 'Ambiental 2026',
    '2026-05-11', 20.49,
    FALSE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '2b517cf0-4f9b-489e-b3c0-675a1b092662', uid, 5, 2026,
    'Contas Fixas de Casa', 'Atêle',
    '2026-05-11', 149.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'ea1af942-3881-41a4-8b7f-6fde89c755dc', uid, 5, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2026-05-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '53e94b10-4ba5-47cf-984b-6a8b1fc947da', uid, 5, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2026-05-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '88117771-03cc-4256-875a-4cf2385c158f', uid, 5, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2321.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '1aae1c35-9eaa-44b6-bfab-6cb0354f8c78', uid, 5, 2026,
    'Escola e Faculdade', 'Alimentação Yan',
    NULL, 194.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '5d07a1be-4406-4f1b-8362-ce909cf4066a', uid, 5, 2026,
    'Vestuário', 'Renner',
    '2026-05-04', 91.9,
    FALSE, '04 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '91269688-9c1a-4fd4-8ac2-d7862b48ffc7', uid, 5, 2026,
    'Vestuário', 'Renner',
    '2026-05-13', 61.94,
    FALSE, '04 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'be36a8a4-06f6-4b1a-9ec2-01e0a1391ebd', uid, 5, 2026,
    'Dentista', 'Dentista Thiago',
    '2026-05-01', 100.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '1c6bda87-7b03-4084-bad2-e10df43f96a7', uid, 5, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2026-05-01', 650.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '07a0bdeb-1037-4fee-8276-629d7fe6536f', uid, 6, 2026,
    'Contas Fixas de Casa', 'Condomínio/Água',
    '2026-06-15', 544.73,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'bca142c1-6d63-4760-8554-11ba1afe2caf', uid, 6, 2026,
    'Contas Fixas de Casa', 'Energia Elétrica',
    '2026-06-24', 254.26,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'f9194b54-be0b-4e9d-ae00-742afcf43f47', uid, 6, 2026,
    'Contas Fixas de Casa', 'IPTU 2026',
    '2026-06-07', 35.74,
    FALSE, '03 de 10'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'e7b1b825-aeb9-468d-859d-1eba3e4acd26', uid, 6, 2026,
    'Contas Fixas de Casa', 'Ambiental 2026',
    '2026-06-11', 20.49,
    FALSE, '03 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'a9e06aba-e1cb-451f-bade-96bee3bd2244', uid, 6, 2026,
    'Contas Fixas de Casa', 'Atêle',
    '2026-06-11', 149.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'a5286011-2b30-497e-a827-a8433a9ab60e', uid, 6, 2026,
    'Contas Fixas de Casa', 'Claro Thiago',
    '2026-06-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'b558853c-8680-4d1d-90bb-7f973a3c7d73', uid, 6, 2026,
    'Contas Fixas de Casa', 'Claro Nayara',
    '2026-06-20', 54.9,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '12529a7c-c3fd-42c1-82e6-ee50c1ce7955', uid, 6, 2026,
    'Escola e Faculdade', 'Escola Legado',
    NULL, 2321.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'ba307d1c-825d-4e5f-99b9-e398d02304b7', uid, 6, 2026,
    'Escola e Faculdade', 'Alimentação Yan',
    NULL, 194.0,
    FALSE, '01 de 12'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'e352a305-46fa-463a-97bd-6fcd2111d5d7', uid, 6, 2026,
    'Vestuário', 'Renner',
    '2026-06-04', 91.9,
    FALSE, '04 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    '243b8f96-eca5-4342-90f0-539b5b6e5f1b', uid, 6, 2026,
    'Vestuário', 'Renner',
    '2026-06-13', 61.94,
    FALSE, '04 de 05'
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'a2bf40f1-5d8d-46ec-ba89-ab6f4e0840ce', uid, 6, 2026,
    'Dentista', 'Dentista Thiago',
    '2026-06-01', 100.0,
    FALSE, NULL
  );
  INSERT INTO contas_fixas (id, user_id, mes, ano, categoria, descricao, data_vencimento, valor, pago, parcela) VALUES (
    'd6adc2da-6c86-4366-b490-a64b9da95dd8', uid, 6, 2026,
    'Gasolina Mensal', 'Gasolina',
    '2026-06-01', 650.0,
    FALSE, NULL
  );

  -- ============================================================
  -- COMBUSTÍVEL
  -- ============================================================
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    'a5f61130-1986-4d3a-8cbc-9134eefe5c1d', uid, 1, 2026,
    '2026-01-01', 25.197,
    160.0, 230749, 6.35
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '5f8d8dc6-a4ab-4f62-ae1f-24c76efae7ed', uid, 1, 2026,
    '2026-01-11', 25.954,
    170.0, 231080, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '9b96e2e0-7fc2-43b3-b0a4-27d9019f65ef', uid, 1, 2026,
    '2026-01-23', NULL,
    150.0, NULL, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '44e2abdb-5462-408a-94e3-775d06a6a8cc', uid, 1, 2026,
    '2026-01-31', 25.954,
    170.0, 231703, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '1dc19e6d-b067-44b5-a9f6-c18b4e42b9b7', uid, 2, 2026,
    '2026-02-12', 24.427,
    160.0, 232289, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '52e97509-24eb-4300-b2b6-0141d8e60255', uid, 2, 2026,
    '2026-02-19', 24.427,
    160.0, 232632, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    'f147134b-1066-412d-89aa-653f30f8368a', uid, 2, 2026,
    '2026-02-24', 25.954,
    170.0, 232876, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    '44ca6919-55ec-487a-b32c-7cac8d7d1c8f', uid, 3, 2026,
    '2026-03-09', 25.955,
    170.0, 233470, 6.55
  );
  INSERT INTO combustivel (id, user_id, mes, ano, data_abastecimento, litros, valor, km, preco_litro) VALUES (
    'b5d0de50-bea8-4b7b-b248-7f1bdfffe78a', uid, 3, 2026,
    '2026-03-16', 22.901,
    150.0, 233988, 6.59
  );

  -- ============================================================
  -- ENTRADAS / SALÁRIOS
  -- ============================================================
  INSERT INTO entradas (id, user_id, mes, ano, descricao, categoria, valor) VALUES (
    '3e26e415-4f0e-40c0-819b-cd82bec2d5c5', uid, 3, 2026,
    'Salário Thiago', 'salario',
    4155.67
  );
  INSERT INTO entradas (id, user_id, mes, ano, descricao, categoria, valor) VALUES (
    '9bd1af7d-5947-4db5-826a-a9d43b794760', uid, 3, 2026,
    'Salário Nayara', 'salario',
    2403.44
  );

END $$;

-- Verificação final:
SELECT 'cartoes' as tabela, COUNT(*) FROM cartoes
UNION ALL SELECT 'lancamentos_cartao', COUNT(*) FROM lancamentos_cartao
UNION ALL SELECT 'contas_fixas', COUNT(*) FROM contas_fixas
UNION ALL SELECT 'combustivel', COUNT(*) FROM combustivel
UNION ALL SELECT 'entradas', COUNT(*) FROM entradas;