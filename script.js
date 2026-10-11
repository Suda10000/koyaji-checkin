// ★ LIFF ID を後で差し替える
const LIFF_ID = "YOUR_LIFF_ID";

// ★ GASのAPI URL（後で差し替える）
const API_URL = "https://script.google.com/macros/s/XXXXX/exec";

window.onload = async () => {
  await liff.init({ liffId: LIFF_ID });

  // ログインしていなければログインさせる
  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  document.getElementById("loginStatus").innerText = "ログイン済み";

  // LINEユーザーID取得
  const profile = await liff.getProfile();
  const lineUserId = profile.userId;

  // URLからイベントIDを取得
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event") || "unknown";

  // GASに照合リクエスト
  const res = await fetch(`${API_URL}?mode=lookup&lineId=${lineUserId}`);
  const data = await res.json();

  if (!data.found) {
    document.getElementById("error").innerText = "登録されていないため受付できません。";
    return;
  }

  // 保護者情報を画面に表示
  document.getElementById("parentName").innerText = data.parentName;
  document.getElementById("studentName").innerText = data.studentName;
  document.getElementById("gradeClass").innerText = `${data.grade}年${data.class}組`;
  document.getElementById("eventName").innerText = eventId;

  document.getElementById("userInfo").style.display = "block";

  // 受付ボタン押下
  document.getElementById("checkinBtn").onclick = async () => {
    const res2 = await fetch(`${API_URL}?mode=checkin&lineId=${lineUserId}&event=${eventId}`);
    const result = await res2.json();

    if (result.status === "ok") {
      document.getElementById("result").innerText = "受付が完了しました。";
      document.getElementById("checkinBtn").style.display = "none";
    } else {
      document.getElementById("result").innerText = "受付済みです。";
    }
  };
};
