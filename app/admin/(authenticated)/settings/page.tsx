import { getSettings } from "@/lib/settings";
import {
  saveLineCredentials,
  saveAnthropicKey,
  issueSetupCodeAction,
  resetOwnerAction,
} from "@/lib/actions/settings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function maskedHint(value: string | null) {
  if (!value) return "未設定";
  return `設定済み（末尾: ...${value.slice(-4)}）`;
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
          LINE設定
        </h2>
        <form action={saveLineCredentials} className="space-y-3">
          <div>
            <Input
              label="チャネルシークレット"
              id="line_channel_secret"
              name="line_channel_secret"
              placeholder={maskedHint(settings.line_channel_secret)}
            />
          </div>
          <div>
            <Input
              label="チャネルアクセストークン"
              id="line_channel_access_token"
              name="line_channel_access_token"
              placeholder={maskedHint(settings.line_channel_access_token)}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            変更する場合のみ入力してください。空欄のままにすると現在の設定が維持されます。
          </p>
          <Button type="submit">LINE設定を保存</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
          Claude API設定
        </h2>
        <form action={saveAnthropicKey} className="space-y-3">
          <Input
            label="Anthropic APIキー"
            id="anthropic_api_key"
            name="anthropic_api_key"
            placeholder={maskedHint(settings.anthropic_api_key)}
          />
          <Button type="submit">APIキーを保存</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
          オーナー様のLINE ID登録
        </h2>
        {settings.owner_line_user_id_confirmed ? (
          <div className="space-y-3">
            <Badge tone="success">設定済み</Badge>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              未回答の質問はこちらのLINEアカウントに通知されます。
            </p>
            <form action={resetOwnerAction}>
              <Button type="submit" variant="secondary">
                登録をリセットする
              </Button>
            </form>
          </div>
        ) : settings.setup_code ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              このコードを、オーナー様ご自身のLINEからbotに送信してください。
            </p>
            <p className="rounded-xl bg-gray-100 px-4 py-3 text-center text-2xl font-mono tracking-widest dark:bg-gray-800">
              {settings.setup_code}
            </p>
            <form action={issueSetupCodeAction}>
              <Button type="submit" variant="secondary">
                コードを再発行する
              </Button>
            </form>
          </div>
        ) : (
          <form action={issueSetupCodeAction}>
            <Button type="submit">コードを発行する</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
