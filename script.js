// ★ LIFF ID を後で差し替える
const LIFF_ID = "2011970419-FxNWlUsY";

// ★ GASのAPI URL（後で差し替える）
const API_URL = "https://script.google.com/macros/s/AKfycbwa2kQurZNeWX1SX2Al96Q8i5KfXFmDJiLKxuBqnd8BC36bMolx3pH5-fDLOM8yxEBz/exec";

window.onload = async () => {
  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  document.getElementById("loginStatus").innerText = "ログイン済み";

  const profile = await liff.getProfile();
  const lineUserId = profile.userId;

  // URLパラメータから eventId を取得
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event") || "unknown";

  // GAS lookup
  const res = await fetch(`${API_URL}?mode=lookup&lineId=${lineUserId}`);
  const data = await res.json();

  // 未登録 → 登録フォーム表示
  if (!data.found) {
    document.getElementById("loginStatus").innerText = "未登録のため、登録が必要です。";
    document.getElementById("registerForm").style.display = "block";

    document.getElementById("registerBtn").onclick = async () => {
      const parentName = document.getElementById("regParentName").value;
      const studentName = document.getElementById("regStudentName").value;
      const grade = document.getElementById("regGrade").value;
      const className = document.getElementById("regClass").value;

      const res3 = await fetch(`${API_URL}?mode=register&lineId=${lineUserId}&parentName=${parentName}&studentName=${studentName}&grade=${grade}&class=${className}`);
      const result3 = await res3.json();

      if (result3.status === "ok") {
        document.getElementById("registerResult").innerText = "登録が完了しました。画面を再読み込みしてください。";
      } else {
        document.getElementById("registerResult").innerText = "登録に失敗しました。";
      }
    };

    return;
  }

  // 登録済み → 受付画面表示
  document.getElementById("parentName").innerText = data.parentName;
  document.getElementById("studentName").innerText = data.studentName;
  document.getElementById("gradeClass").innerText = `${data.grade}年${data.class}組`;
  document.getElementById("eventName").innerText = eventId;

  document.getElementById("userInfo").style.display = "block";

  // 受付ボタン
  document.getElementById("checkinBtn").onclick = async () => {
    const res2 = await fetch(`${API_URL}?mode=checkin&lineId=${lineUserId}&event=${eventId}`);
    const result2 = await res2.json();

    if (result2.status === "ok") {
      document.getElementById("result").innerText = "受付が完了しました。";
      document.getElementById("checkinBtn").style.display = "none";
    } else {
      document.getElementById("result").innerText = "受付済みです。";
    }
  };
};
