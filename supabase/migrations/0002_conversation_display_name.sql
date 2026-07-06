-- LINEの表示名を保存し、要対応の質問がどのお客様のものか
-- オーナーがLINEアプリ側のトーク一覧から見つけやすくする
alter table conversations add column display_name text;
