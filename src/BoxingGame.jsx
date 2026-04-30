import { useEffect, useRef, useState } from "react";
import muayThaiLogo from "./assets/muaythai-neon-logo.png";
import resultBaby from "./assets/result-baby.jpg";
import resultDiamondBelt from "./assets/result-diamond-belt.png";
import resultGoldBelt from "./assets/result-gold-belt.png";

const PUNCH_OUT_CM = 18;
const PUNCH_RESET_CM = 10;
const PUNCH_COOLDOWN_MS = 260;
const MIN_WRIST_VISIBILITY = 0.55;
const SIDE_ZONE_SOFT_MARGIN_RATIO = 0.18;
const SIDE_ZONE_HARD_MARGIN_RATIO = 0.38;
const ROUND_SECONDS = 15;
const TARGET_COUNT = 3;
const TARGET_LIFETIME_MS = 950;
const TARGET_HIT_COOLDOWN_MS = 180;
const TARGET_HIT_MOVE_CM = 11;
const TARGET_RADIUS_RATIO = 0.072;
const FIST_FORWARD_OFFSET_RATIO = 0.075;
const FIST_HIT_RADIUS_RATIO = 0.05;
const ELBOW_MOVE_CM = 4;
const ELBOW_RESET_CM = 2;
const ELBOW_HIT_RADIUS_RATIO = 0.075;
const ELBOW_LINE_Y_RATIO = 0.32;
const ELBOW_COOLDOWN_MS = 350;

const FOOTER_LINES = [
  "Keep your guard high. Punch fast for 15 seconds.",
  "ตั้งการ์ดให้สูง แล้วต่อยให้ไวใน 15 วินาที",
  "保持防守姿势，15秒内全力快打！",
];

const getResultAward = (score) => {
  if (score < 53) {
    return {
      image: resultBaby,
      title: "Go back to practice bro !!!",
      message: "还好哈哈哈 回去多练吧兄弟",
      tone: "baby",
    };
  }

  if (score < 61) {
    return {
      image: resultGoldBelt,
      title: "Muay Thai championship Gold Belt",
      message: "太厉害了！",
      tone: "gold",
    };
  }

  return {
    image: resultDiamondBelt,
    title: "Muay Thai championship Diamond Belt",
    message: "泰拳冠军·钻石腰带, 传奇级表现 !!!",
    tone: "diamond",
  };
};

export default function BoxingStateGame() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameStatus, setGameStatus] = useState("IDLE");
  const [readyCountdown, setReadyCountdown] = useState(5);
  const [total, setTotal] = useState(0);
  const [footerIndex, setFooterIndex] = useState(0);
  const [station, setStation] = useState(1);
  const [stationOneScore, setStationOneScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [elbowScore, setElbowScore] = useState(0);
  const [hasFinalResult, setHasFinalResult] = useState(false);
  const [scoreRevealStep, setScoreRevealStep] = useState(0);

  const statusRef = useRef("IDLE");
  const stationRef = useRef(1);
  const stationOneScoreRef = useRef(0);
  const targetScoreRef = useRef(0);
  const elbowScoreRef = useRef(0);
  const targetsRef = useRef([]);
  const targetTimeoutsRef = useRef([]);
  const lastTargetHitAtRef = useRef(0);
  const elbowAnchorRef = useRef({ left: null, right: null });
  const elbowOutRef = useRef({ left: false, right: false });
  const lastElbowHitAtRef = useRef({ left: 0, right: 0 });
  const countsRef = useRef({ left: 0, right: 0 });
  const anchorPosRef = useRef({ left: null, right: null });
  const isOutRef = useRef({ left: false, right: false });
  const lastPunchAtRef = useRef({ left: 0, right: 0 });
  const footerLine = FOOTER_LINES[footerIndex];
  const resultAward = getResultAward(total);

  const clearTargetTimer = () => {
    targetTimeoutsRef.current.forEach((timer) => clearTimeout(timer));
    targetTimeoutsRef.current = [];
  };

  const clearTarget = () => {
    clearTargetTimer();
    targetsRef.current = [];
  };

  const resetElbows = () => {
    elbowAnchorRef.current = { left: null, right: null };
    elbowOutRef.current = { left: false, right: false };
    lastElbowHitAtRef.current = { left: 0, right: 0 };
  };

  const startGame = () => {
    clearTarget();
    setLeftCount(0); setRightCount(0); setTimeLeft(ROUND_SECONDS); setReadyCountdown(5); setTotal(0);
    setStation(1); setStationOneScore(0); setTargetScore(0); setElbowScore(0); setHasFinalResult(false);
    setScoreRevealStep(0);
    stationRef.current = 1;
    stationOneScoreRef.current = 0;
    targetScoreRef.current = 0;
    elbowScoreRef.current = 0;
    countsRef.current = { left: 0, right: 0 };
    isOutRef.current = { left: false, right: false };
    lastPunchAtRef.current = { left: 0, right: 0 };
    lastTargetHitAtRef.current = 0;
    anchorPosRef.current = { left: null, right: null };
    resetElbows();
    setGameStatus("READY");
    statusRef.current = "READY";
  };

  const startStationTwo = () => {
    clearTarget();
    setStation(2);
    stationRef.current = 2;
    setTimeLeft(ROUND_SECONDS);
    setReadyCountdown(5);
    setTargetScore(0);
    targetScoreRef.current = 0;
    isOutRef.current = { left: false, right: false };
    lastPunchAtRef.current = { left: 0, right: 0 };
    lastTargetHitAtRef.current = 0;
    anchorPosRef.current = { left: null, right: null };
    resetElbows();
    setGameStatus("READY");
    statusRef.current = "READY";
  };

  const startStationThree = () => {
    clearTarget();
    setStation(3);
    stationRef.current = 3;
    setTimeLeft(ROUND_SECONDS);
    setReadyCountdown(5);
    setElbowScore(0);
    elbowScoreRef.current = 0;
    isOutRef.current = { left: false, right: false };
    lastPunchAtRef.current = { left: 0, right: 0 };
    lastTargetHitAtRef.current = 0;
    anchorPosRef.current = { left: null, right: null };
    resetElbows();
    setGameStatus("READY");
    statusRef.current = "READY";
  };

  const createRandomTarget = (index) => {
    if (stationRef.current !== 2 || statusRef.current !== "GO" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;

    const radius = Math.max(30, Math.min(width, height) * TARGET_RADIUS_RATIO);
    const minX = radius + 22;
    const maxX = width - radius - 22;
    const minY = Math.max(radius + 74, height * 0.16);
    const maxY = Math.max(minY + 1, height - radius - Math.max(112, height * 0.2));

    const existingTargets = targetsRef.current.filter((target) => target && target.index !== index);
    let candidate = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      candidate = {
        id: `${index}-${performance.now()}`,
        index,
        x: minX + Math.random() * Math.max(1, maxX - minX),
        y: minY + Math.random() * Math.max(1, maxY - minY),
        radius,
        bornAt: performance.now(),
      };

      const overlaps = existingTargets.some((target) => {
        const dx = candidate.x - target.x;
        const dy = candidate.y - target.y;
        return Math.sqrt(dx * dx + dy * dy) < radius * 2.25;
      });

      if (!overlaps) break;
    }

    return candidate;
  };

  const spawnTarget = (index) => {
    const target = createRandomTarget(index);
    if (!target) return;

    targetsRef.current[index] = target;
    if (targetTimeoutsRef.current[index]) {
      clearTimeout(targetTimeoutsRef.current[index]);
    }

    targetTimeoutsRef.current[index] = setTimeout(() => {
      spawnTarget(index);
    }, TARGET_LIFETIME_MS);
  };

  const spawnAllTargets = () => {
    clearTarget();
    for (let i = 0; i < TARGET_COUNT; i += 1) {
      spawnTarget(i);
    }
  };

  const onResults = (results) => {
    if (!canvasRef.current || !results) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const guardMarkers = [];
    const fistMarkers = [];
    const elbowMarkers = [];
    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
    ctx.clearRect(0, 0, width, height);
    if (results.image) ctx.drawImage(results.image, 0, 0, width, height);

    if (results.poseLandmarks) {
      const lm = results.poseLandmarks;
      const leftWrist = lm[15];
      const rightWrist = lm[16];
      const leftShoulder = lm[11];
      const rightShoulder = lm[12];
      const leftElbow = lm[13];
      const rightElbow = lm[14];

      if (statusRef.current === "READY" && stationRef.current !== 3 && leftWrist && rightWrist && leftShoulder && rightShoulder) {
        anchorPosRef.current.left = {
          x: leftWrist.x - leftShoulder.x,
          y: leftWrist.y - leftShoulder.y,
        };
        anchorPosRef.current.right = {
          x: rightWrist.x - rightShoulder.x,
          y: rightWrist.y - rightShoulder.y,
        };
      } else if (statusRef.current === "READY" && stationRef.current === 3 && leftElbow && rightElbow && leftShoulder && rightShoulder) {
        elbowAnchorRef.current.left = {
          x: leftElbow.x - leftShoulder.x,
          y: leftElbow.y - leftShoulder.y,
        };
        elbowAnchorRef.current.right = {
          x: rightElbow.x - rightShoulder.x,
          y: rightElbow.y - rightShoulder.y,
        };
      }

      const drawUI = (point, color, side) => {
        if (!point || point.visibility < MIN_WRIST_VISIBILITY) return;
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, 15, 0, 2 * Math.PI);
        ctx.fillStyle = isOutRef.current[side] ? color : "#FFF";
        ctx.fill();
        ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
      };

      if (stationRef.current === 3) {
        drawUI(leftElbow, "#FF2E63", "left");
        drawUI(rightElbow, "#08D9D6", "right");
      } else {
        drawUI(leftWrist, "#FF2E63", "left");
        drawUI(rightWrist, "#08D9D6", "right");
      }

      if (statusRef.current === "READY" && stationRef.current !== 3) {
        if (leftWrist && leftWrist.visibility >= MIN_WRIST_VISIBILITY) {
          guardMarkers.push({ x: width - leftWrist.x * width, y: leftWrist.y * height, color: "#FF1744" });
        }
        if (rightWrist && rightWrist.visibility >= MIN_WRIST_VISIBILITY) {
          guardMarkers.push({ x: width - rightWrist.x * width, y: rightWrist.y * height, color: "#1E9BFF" });
        }
      } else if (statusRef.current === "GO" && stationRef.current !== 3 && leftShoulder && rightShoulder) {
        const leftGuard = anchorPosRef.current.left && {
          x: leftShoulder.x + anchorPosRef.current.left.x,
          y: leftShoulder.y + anchorPosRef.current.left.y,
        };
        const rightGuard = anchorPosRef.current.right && {
          x: rightShoulder.x + anchorPosRef.current.right.x,
          y: rightShoulder.y + anchorPosRef.current.right.y,
        };

        if (leftGuard) {
          guardMarkers.push({
            x: width - leftGuard.x * width,
            y: leftGuard.y * height,
            color: "#FF1744",
            compact: true,
          });
        }
        if (rightGuard) {
          guardMarkers.push({
            x: width - rightGuard.x * width,
            y: rightGuard.y * height,
            color: "#1E9BFF",
            compact: true,
          });
        }
      }

      if (statusRef.current === "GO" && stationRef.current === 1) {
        detectPunches({
          leftWrist,
          rightWrist,
          leftShoulder,
          rightShoulder,
          width,
          height,
        });
      } else if (statusRef.current === "GO" && stationRef.current === 2) {
        const hands = getTargetHands({
          leftWrist,
          rightWrist,
          leftShoulder,
          rightShoulder,
          width,
          height,
        });

        fistMarkers.push(...hands);
        detectTargetPunch(hands);
      } else if (statusRef.current === "GO" && stationRef.current === 3) {
        const elbows = getElbowMotions({
          leftElbow,
          rightElbow,
          leftShoulder,
          rightShoulder,
          width,
          height,
        });

        elbowMarkers.push(...elbows);
        detectElbowHits(elbows, width, height);
      }
    }
    ctx.restore();

    if (statusRef.current === "GO" && stationRef.current === 2) {
      targetsRef.current.filter(Boolean).forEach((target) => drawTarget(ctx, target));
    }

    if (statusRef.current === "GO" && stationRef.current === 3) {
      drawElbowTargets(ctx, width, height);
    }

    guardMarkers.forEach((marker) => {
      drawGuardMarker(ctx, marker);
    });

    fistMarkers.forEach((marker) => {
      drawFistMarker(ctx, marker);
    });

    elbowMarkers.forEach((marker) => {
      drawElbowMarker(ctx, marker);
    });
  };

  const drawTarget = (ctx, target) => {
    const age = performance.now() - target.bornAt;
    const pulse = 1 + Math.sin(age / 115) * 0.08;

    ctx.save();
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 1.35 * pulse, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 230, 120, 0.22)";
    ctx.lineWidth = 8;
    ctx.shadowColor = "#FFD84A";
    ctx.shadowBlur = 24;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#FFD84A";
    ctx.shadowBlur = 22;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.68, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFD84A";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(target.x, target.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.font = "900 12px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("HIT", target.x, target.y - target.radius - 16);
    ctx.restore();
  };

  const drawGuardMarker = (ctx, marker) => {
    const innerRadius = marker.compact ? 22 : 28;
    const outerRadius = marker.compact ? 34 : 42;
    const label = marker.compact ? "GUARD" : "GUARD HERE";

    ctx.save();
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, innerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = marker.compact ? 2 : 3;
    ctx.shadowColor = marker.color;
    ctx.shadowBlur = marker.compact ? 10 : 16;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(marker.x, marker.y, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = marker.compact ? "rgba(30,155,255,0.32)" : "rgba(255,23,68,0.38)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `${marker.compact ? 700 : 800} ${marker.compact ? 10 : 12}px Segoe UI, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowBlur = marker.compact ? 6 : 10;
    ctx.fillText(label, marker.x, marker.y - outerRadius + 4);
    ctx.restore();
  };

  const drawFistMarker = (ctx, marker) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(marker.fistX, marker.fistY, marker.hitRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = marker.side === "left" ? "rgba(255,23,68,0.78)" : "rgba(30,155,255,0.78)";
    ctx.lineWidth = 2;
    ctx.shadowColor = marker.side === "left" ? "#FF1744" : "#1E9BFF";
    ctx.shadowBlur = 14;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(marker.fistX, marker.fistY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();
  };

  const getElbowTargets = (w, h) => {
    const lineY = h * ELBOW_LINE_Y_RATIO;
    return {
      left: { side: "left", y: lineY, xStart: w * 0.05, xEnd: w * 0.48, color: "#FF1744" },
      right: { side: "right", y: lineY, xStart: w * 0.52, xEnd: w * 0.95, color: "#1E9BFF" },
    };
  };

  const drawElbowTargets = (ctx, w, h) => {
    const targets = getElbowTargets(w, h);
    const pulse = 0.85 + Math.sin(performance.now() / 280) * 0.15;

    Object.values(targets).forEach((target) => {
      ctx.save();

      ctx.beginPath();
      ctx.moveTo(target.xStart, target.y);
      ctx.lineTo(target.xEnd, target.y);
      ctx.strokeStyle = target.color;
      ctx.lineWidth = 14;
      ctx.shadowColor = target.color;
      ctx.shadowBlur = 32 * pulse;
      ctx.globalAlpha = 0.35;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(target.xStart, target.y);
      ctx.lineTo(target.xEnd, target.y);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.shadowColor = target.color;
      ctx.shadowBlur = 22;
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.font = "900 11px Segoe UI, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = target.color;
      ctx.shadowBlur = 14;
      ctx.fillText("RAISE ELBOW", (target.xStart + target.xEnd) / 2, target.y - 8);
      ctx.restore();
    });
  };

  const drawElbowMarker = (ctx, marker) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, marker.hitRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = marker.side === "left" ? "rgba(255,23,68,0.86)" : "rgba(30,155,255,0.86)";
    ctx.lineWidth = 2;
    ctx.shadowColor = marker.side === "left" ? "#FF1744" : "#1E9BFF";
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.restore();
  };

  const getPunchMotion = (wrist, side, sameShoulder, otherShoulder, w, h) => {
    const anchor = anchorPosRef.current[side];
    if (!wrist || !sameShoulder || !otherShoulder || wrist.visibility < MIN_WRIST_VISIBILITY) {
      return { side, valid: false };
    }
    if (!anchor) return { side, valid: false };

    const shoulderWidthPx = Math.abs(sameShoulder.x - otherShoulder.x) * w;
    const oneCm = (shoulderWidthPx / 40) || 1;
    const shoulderCenterX = (sameShoulder.x + otherShoulder.x) / 2;
    const sideSign = sameShoulder.x >= otherShoulder.x ? 1 : -1;
    const shoulderWidthRatio = Math.abs(sameShoulder.x - otherShoulder.x);
    const sideOffset = (wrist.x - shoulderCenterX) * sideSign;
    const softSideMargin = Math.max(0.025, shoulderWidthRatio * SIDE_ZONE_SOFT_MARGIN_RATIO);
    const hardSideMargin = Math.max(0.06, shoulderWidthRatio * SIDE_ZONE_HARD_MARGIN_RATIO);
    const isOnOwnSide = sideOffset >= -softSideMargin;
    const isInsideAllowedSide = sideOffset >= -hardSideMargin;
    const relativeX = wrist.x - sameShoulder.x;
    const relativeY = wrist.y - sameShoulder.y;
    const dx = (relativeX - anchor.x) * w;
    const dy = (relativeY - anchor.y) * h;
    const distFromAnchor = Math.sqrt(dx * dx + dy * dy) / oneCm;
    const now = performance.now();
    const canCount = now - lastPunchAtRef.current[side] > PUNCH_COOLDOWN_MS;

    return {
      side,
      valid: true,
      distFromAnchor,
      isOnOwnSide,
      isInsideAllowedSide,
      score: distFromAnchor * (isOnOwnSide ? 1 : 0.82),
      canCount,
      shouldCount: isInsideAllowedSide && distFromAnchor > PUNCH_OUT_CM && !isOutRef.current[side] && canCount,
    };
  };

  const applyPunchMotion = (motion, action) => {
    if (!motion.valid || !motion.isInsideAllowedSide || motion.distFromAnchor < PUNCH_RESET_CM) {
      isOutRef.current[motion.side] = false;
      return;
    }

    if (action === "count") {
      countsRef.current[motion.side] += 1;
      if (motion.side === "left") setLeftCount(countsRef.current.left);
      else setRightCount(countsRef.current.right);

      isOutRef.current[motion.side] = true;
      lastPunchAtRef.current[motion.side] = performance.now();
    } else if (action === "block") {
      isOutRef.current[motion.side] = true;
    }
  };

  const detectPunches = ({ leftWrist, rightWrist, leftShoulder, rightShoulder, width, height }) => {
    const leftMotion = getPunchMotion(leftWrist, "left", leftShoulder, rightShoulder, width, height);
    const rightMotion = getPunchMotion(rightWrist, "right", rightShoulder, leftShoulder, width, height);
    const candidates = [leftMotion, rightMotion].filter((motion) => motion.shouldCount);

    if (candidates.length === 0) {
      applyPunchMotion(leftMotion, "idle");
      applyPunchMotion(rightMotion, "idle");
      return;
    }

    const winner = candidates.length === 1
      ? candidates[0]
      : candidates.reduce((best, motion) => (
          motion.score > best.score ? motion : best
        ));

    applyPunchMotion(leftMotion, leftMotion.side === winner.side ? "count" : "block");
    applyPunchMotion(rightMotion, rightMotion.side === winner.side ? "count" : "block");
  };

  const getTargetHandMotion = (wrist, side, sameShoulder, otherShoulder, w, h) => {
    const anchor = anchorPosRef.current[side];
    if (!wrist || !sameShoulder || !otherShoulder || !anchor || wrist.visibility < MIN_WRIST_VISIBILITY) {
      return null;
    }

    const shoulderWidthPx = Math.abs(sameShoulder.x - otherShoulder.x) * w;
    const oneCm = (shoulderWidthPx / 40) || 1;
    const relativeX = wrist.x - sameShoulder.x;
    const relativeY = wrist.y - sameShoulder.y;
    const dx = (relativeX - anchor.x) * w;
    const dy = (relativeY - anchor.y) * h;
    const wristX = w - wrist.x * w;
    const wristY = wrist.y * h;
    const guardX = w - (sameShoulder.x + anchor.x) * w;
    const guardY = (sameShoulder.y + anchor.y) * h;
    const punchX = wristX - guardX;
    const punchY = wristY - guardY;
    const punchLength = Math.sqrt(punchX * punchX + punchY * punchY) || 1;
    const fistOffset = Math.min(w, h) * FIST_FORWARD_OFFSET_RATIO;

    return {
      side,
      wristX,
      wristY,
      fistX: wristX + (punchX / punchLength) * fistOffset,
      fistY: wristY + (punchY / punchLength) * fistOffset,
      hitRadius: Math.max(18, Math.min(w, h) * FIST_HIT_RADIUS_RATIO),
      moveCm: Math.sqrt(dx * dx + dy * dy) / oneCm,
    };
  };

  const getTargetHands = ({ leftWrist, rightWrist, leftShoulder, rightShoulder, width, height }) => ([
    getTargetHandMotion(leftWrist, "left", leftShoulder, rightShoulder, width, height),
    getTargetHandMotion(rightWrist, "right", rightShoulder, leftShoulder, width, height),
  ].filter(Boolean));

  const detectTargetPunch = (hands) => {
    const targets = targetsRef.current.filter(Boolean);
    if (!targets.length) return;

    const now = performance.now();
    if (now - lastTargetHitAtRef.current < TARGET_HIT_COOLDOWN_MS) return;

    let hitTarget = null;
    for (const target of targets) {
      const hit = hands.some((hand) => {
        if (hand.moveCm < TARGET_HIT_MOVE_CM) return false;
        const dx = hand.fistX - target.x;
        const dy = hand.fistY - target.y;
        return Math.sqrt(dx * dx + dy * dy) <= target.radius + hand.hitRadius;
      });

      if (hit) {
        hitTarget = target;
        break;
      }
    }

    if (!hitTarget) return;

    lastTargetHitAtRef.current = now;
    targetScoreRef.current += 1;
    setTargetScore(targetScoreRef.current);
    spawnTarget(hitTarget.index);
  };

  const getElbowMotion = (elbow, side, sameShoulder, otherShoulder, w, h) => {
    const anchor = elbowAnchorRef.current[side];
    if (!elbow || !sameShoulder || !otherShoulder || !anchor || elbow.visibility < MIN_WRIST_VISIBILITY) {
      return null;
    }

    const shoulderWidthPx = Math.abs(sameShoulder.x - otherShoulder.x) * w;
    const oneCm = (shoulderWidthPx / 40) || 1;
    const relativeX = elbow.x - sameShoulder.x;
    const relativeY = elbow.y - sameShoulder.y;
    const dx = (relativeX - anchor.x) * w;
    const dy = (relativeY - anchor.y) * h;

    return {
      side,
      x: w - elbow.x * w,
      y: elbow.y * h,
      moveCm: Math.sqrt(dx * dx + dy * dy) / oneCm,
      hitRadius: Math.max(20, Math.min(w, h) * ELBOW_HIT_RADIUS_RATIO),
    };
  };

  const getElbowMotions = ({ leftElbow, rightElbow, leftShoulder, rightShoulder, width, height }) => ([
    getElbowMotion(leftElbow, "left", leftShoulder, rightShoulder, width, height),
    getElbowMotion(rightElbow, "right", rightShoulder, leftShoulder, width, height),
  ].filter(Boolean));

  const detectElbowHits = (elbows, width, height) => {
    const targets = getElbowTargets(width, height);
    const now = performance.now();

    elbows.forEach((elbow) => {
      const target = targets[elbow.side];
      if (!target) return;

      const isAboveLine = elbow.y <= target.y;
      const inXRange = elbow.x >= target.xStart && elbow.x <= target.xEnd;
      const reachedLine = isAboveLine && inXRange;
      const canCount = now - lastElbowHitAtRef.current[elbow.side] > ELBOW_COOLDOWN_MS;

      if (reachedLine && elbow.moveCm > ELBOW_MOVE_CM && !elbowOutRef.current[elbow.side] && canCount) {
        elbowScoreRef.current += 1;
        setElbowScore(elbowScoreRef.current);
        elbowOutRef.current[elbow.side] = true;
        lastElbowHitAtRef.current[elbow.side] = now;
      } else if (!isAboveLine || elbow.moveCm < ELBOW_RESET_CM) {
        elbowOutRef.current[elbow.side] = false;
      }
    });
  };

  useEffect(() => {
    if (gameStatus === "READY" && readyCountdown > 0) {
      const t = setTimeout(() => setReadyCountdown(readyCountdown - 1), 1000);
      return () => clearTimeout(t);
    } else if (gameStatus === "READY") {
      lastPunchAtRef.current = { left: performance.now(), right: performance.now() };
      setGameStatus("GO"); statusRef.current = "GO";
      if (stationRef.current === 2) {
        setTimeout(spawnAllTargets, 0);
      }
    }
    if (gameStatus === "GO" && timeLeft > 0) {
      const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(t);
    } else if (gameStatus === "GO") {
      clearTarget();
      if (stationRef.current === 1) {
        const speedScore = countsRef.current.left + countsRef.current.right;
        stationOneScoreRef.current = speedScore;
        setStationOneScore(speedScore);
        setGameStatus("BETWEEN");
        statusRef.current = "BETWEEN";
      } else if (stationRef.current === 2) {
        setGameStatus("BETWEEN");
        statusRef.current = "BETWEEN";
      } else {
        setTotal(stationOneScoreRef.current + targetScoreRef.current + elbowScoreRef.current);
        setHasFinalResult(true);
        setScoreRevealStep(0);
        setGameStatus("IDLE");
        statusRef.current = "IDLE";
      }
    }
  }, [gameStatus, readyCountdown, timeLeft]);

  useEffect(() => {
    const pose = new window.Pose({ locateFile: (f) => `${import.meta.env.BASE_URL}mediapipe/pose/${f}` });
    pose.setOptions({ modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });
    pose.onResults(onResults);
    if (videoRef.current) {
      new window.Camera(videoRef.current, {
        onFrame: async () => await pose.send({ image: videoRef.current }),
        width: 1280, height: 720,
      }).start();
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFooterIndex((index) => (index + 1) % FOOTER_LINES.length);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => clearTarget();
  }, []);

  useEffect(() => {
    if (!hasFinalResult) return;

    const timers = [1, 2, 3, 4].map((step, index) => (
      setTimeout(() => setScoreRevealStep(step), 450 + index * 520)
    ));

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [hasFinalResult]);

  return (
    <div style={s.pageWrapper}>
      <style>
        {`
          @keyframes footerSlideUp {
            0% { opacity: 0; transform: translateY(16px); }
            18% { opacity: 1; transform: translateY(0); }
            82% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-14px); }
          }
          @keyframes scoreReveal {
            0% { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(4px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
        `}
      </style>
      <div style={s.mainFrame}>
        
        <div style={s.arena}>
          <div style={s.videoWrapper}>
            <video ref={videoRef} style={{ display: "none" }} />
            <canvas ref={canvasRef} style={s.canvas} />

            <div style={s.innerTitleBox}>
              <span style={s.muaythaiText}>MUAYTHAI</span>
              <span style={s.speedText}>SPEED</span>
            </div>

            <div style={s.scoreOverlay}>
              {station === 1 ? (
                <>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>LEFT</div>
                    <div style={{...s.scoreValue, color: "#FF1744"}}>{leftCount}</div>
                  </div>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>RIGHT</div>
                    <div style={{...s.scoreValue, color: "#1E9BFF"}}>{rightCount}</div>
                  </div>
                </>
              ) : station === 2 ? (
                <>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>SPEED</div>
                    <div style={{...s.scoreValue, color: "#FF1744"}}>{stationOneScore}</div>
                  </div>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>TARGET</div>
                    <div style={{...s.scoreValue, color: "#FFD84A"}}>{targetScore}</div>
                  </div>
                </>
              ) : (
                <>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>TARGET</div>
                    <div style={{...s.scoreValue, color: "#FFD84A"}}>{targetScore}</div>
                  </div>
                  <div style={s.scoreBox}>
                    <div style={s.scoreLabel}>ELBOW</div>
                    <div style={{...s.scoreValue, color: "#1E9BFF"}}>{elbowScore}</div>
                  </div>
                </>
              )}
            </div>

            {gameStatus === "GO" && <div style={s.timerTag}>S{station} {timeLeft}s</div>}

            {(gameStatus === "READY" || gameStatus === "BETWEEN" || gameStatus === "IDLE") && (
              <div style={gameStatus === "READY" ? {...s.overlay, ...s.readyOverlay} : s.overlay}>
                {gameStatus === "READY" ? (
                  <div style={s.readyGroup}>
                    <div style={s.readyLabel}>
                      {station === 1
                        ? "STATION 1: SPEED PUNCH"
                        : station === 2
                          ? "STATION 2: TARGET"
                          : "STATION 3: ELBOW STRIKE"}
                    </div>
                    <div style={s.countdownText}>{readyCountdown}</div>
                    <div style={s.readyHint}>
                      {station === 1
                        ? "Hold both hands on the neon guard rings"
                        : station === 2
                          ? "Punch the gold circles before they move"
                          : "Use elbows to reach the upper circles"}
                    </div>
                  </div>
                ) : gameStatus === "BETWEEN" ? (
                  <div style={s.resultGroup}>
                    <div style={s.resBox}>
                      <div style={s.resLabel}>
                        {station === 1 ? "STATION 1 COMPLETE" : "STATION 2 COMPLETE"}
                      </div>
                      <div style={s.resTotal}>{station === 1 ? stationOneScore : targetScore}</div>
                      <div style={s.resultSubtext}>
                        {station === 1 ? "Next: target punch" : "Next: upper elbow strike"}
                      </div>
                    </div>
                    <button onClick={station === 1 ? startStationTwo : startStationThree} style={s.btnStart}>
                      {station === 1 ? "START STATION 2" : "START STATION 3"}
                    </button>
                  </div>
                ) : (
                  <div style={s.resultGroup}>
                    {hasFinalResult ? (
                      <>
                        <div style={s.finalSummary}>
                          <div style={s.resLabel}>MATCH SUMMARY</div>

                          {scoreRevealStep >= 1 && (
                            <div style={{...s.summaryRow, animationDelay: "0ms"}}>
                              <span style={s.summaryLabel}>Speed Punch</span>
                              <span style={{...s.summaryValue, color: "#FF1744"}}>{stationOneScore}</span>
                            </div>
                          )}

                          {scoreRevealStep >= 2 && (
                            <div style={{...s.summaryRow, animationDelay: "0ms"}}>
                              <span style={s.summaryLabel}>Target</span>
                              <span style={{...s.summaryValue, color: "#FFD84A"}}>{targetScore}</span>
                            </div>
                          )}

                          {scoreRevealStep >= 3 && (
                            <div style={{...s.summaryRow, animationDelay: "0ms"}}>
                              <span style={s.summaryLabel}>Elbow Strike</span>
                              <span style={{...s.summaryValue, color: "#1E9BFF"}}>{elbowScore}</span>
                            </div>
                          )}

                          {scoreRevealStep >= 4 && (
                            <div style={s.finalTotalBox}>
                              <div style={s.resLabel}>TOTAL SCORE</div>
                              <div style={s.resTotal}>{total}</div>
                              <img
                                src={resultAward.image}
                                alt={resultAward.title}
                                style={{
                                  ...s.resultAwardImage,
                                  ...(resultAward.tone === "baby" ? s.resultAwardBaby : {}),
                                }}
                              />
                              <div
                                style={{
                                  ...s.awardTitle,
                                  ...(resultAward.tone === "gold" ? s.awardGold : {}),
                                  ...(resultAward.tone === "diamond" ? s.awardDiamond : {}),
                                }}
                              >
                                {resultAward.title}
                              </div>
                              <div style={s.awardMessage}>{resultAward.message}</div>
                              <button onClick={startGame} style={s.finalPlayAgain}>PLAY AGAIN</button>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={muayThaiLogo} alt="Muay Thai Speed" style={s.startLogo} />
                        <div style={s.startTitle}>MUAYTHAI SPEED</div>
                        <button onClick={startGame} style={s.btnStart}>START GAME</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={s.footerContainer}>
          <div style={s.footerPanel}>
            <div style={s.footerCopy}>
              <div key={footerIndex} className="footer-slide-text" style={s.footerText}>
                {footerLine}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  pageWrapper: {
    backgroundColor: "#03040A",
    backgroundImage:
      "radial-gradient(circle at 50% 0%, rgba(255,23,68,0.24), transparent 34%), radial-gradient(circle at 86% 88%, rgba(30,155,255,0.2), transparent 32%), linear-gradient(145deg, #03040A 0%, #080B14 52%, #010104 100%)",
    height: "100dvh",
    minHeight: "560px",
    width: "100vw",
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    overflow: "hidden", 
    padding: "clamp(8px, 2.5vw, 22px)",
    boxSizing: "border-box",
  },
  mainFrame: {
    backgroundColor: "#070911",
    color: "#F8FBFF",
    width: "min(calc(100vw - 16px), 520px)",
    height: "min(calc(100dvh - 16px), 920px)",
    aspectRatio: "9 / 16",
    maxHeight: "920px",
    display: "flex", 
    flexDirection: "column",
    alignItems: "center", 
    padding: "clamp(42px, 6.5dvh, 62px) clamp(12px, 3.5vw, 22px) clamp(14px, 2.5dvh, 22px)",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    position: "relative",
    borderRadius: "clamp(28px, 7vw, 46px)",
    border: "2px solid transparent",
    backgroundImage:
      "linear-gradient(155deg, rgba(9,12,22,0.98), rgba(2,3,8,0.98)), linear-gradient(145deg, #FFFFFF 0%, #FF1744 28%, #121827 50%, #1E9BFF 74%, #FFFFFF 100%)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
    boxShadow:
      "0 24px 70px rgba(0,0,0,0.72), 0 0 36px rgba(255,23,68,0.24), 0 0 34px rgba(30,155,255,0.18), inset 0 0 34px rgba(255,255,255,0.05)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  innerTitleBox: {
    position: "absolute", 
    top: "clamp(13px, 2.8dvh, 22px)",
    width: "calc(100% - 32px)",
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    gap: "clamp(7px, 2vw, 12px)",
    zIndex: 6,
  },
  muaythaiText: {
    fontSize: "clamp(1.16rem, 5.4vw, 1.75rem)",
    fontWeight: "900",
    color: "#FFFFFF",
    textShadow: "0 0 9px rgba(255,23,68,0.95), 0 0 20px rgba(255,23,68,0.48)",
    WebkitTextStroke: "1px #FF1744",
    letterSpacing: "0",
  },
  speedText: {
    fontSize: "clamp(1.16rem, 5.4vw, 1.75rem)",
    fontWeight: "900",
    color: "#FFFFFF",
    fontStyle: "italic",
    textShadow: "0 0 10px rgba(30,155,255,0.95), 0 0 22px rgba(30,155,255,0.5)",
  },
  arena: { 
    width: "100%", 
    flex: 1, 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center", 
    minHeight: 0,
  },
  videoWrapper: {
    position: "relative", 
    width: "100%", 
    height: "100%",
    backgroundColor: "#02030A",
    borderRadius: "clamp(20px, 5vw, 30px)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow:
      "inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 40px rgba(0,0,0,0.72), 0 0 18px rgba(255,23,68,0.16), 0 0 18px rgba(30,155,255,0.12)",
  },
  canvas: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "contrast(1.08) saturate(0.95)",
  },
  scoreOverlay: {
    position: "absolute", 
    bottom: "0", 
    left: "0", 
    right: "0",
    display: "flex", 
    justifyContent: "space-between", 
    padding: "clamp(14px, 3dvh, 22px) clamp(22px, 7vw, 38px)",
    background:
      "linear-gradient(transparent, rgba(0,0,0,0.96) 58%), linear-gradient(90deg, rgba(255,23,68,0.2), transparent 42%, rgba(30,155,255,0.2))",
    zIndex: 5,
  },
  scoreBox: {
    textAlign: "center",
    minWidth: "76px",
  },
  scoreLabel: {
    fontSize: "clamp(0.66rem, 2.4vw, 0.78rem)",
    color: "#DCEBFF",
    fontWeight: "800",
  },
  scoreValue: {
    fontSize: "clamp(2.6rem, 12vw, 4rem)",
    fontWeight: "900",
    lineHeight: "0.95",
    textShadow: "0 0 18px currentColor",
  },
  timerTag: { 
    position: "absolute", 
    top: "clamp(58px, 10dvh, 84px)",
    left: "50%", 
    transform: "translateX(-50%)", 
    background: "linear-gradient(135deg, #FFFFFF, #FF1744 48%, #1E9BFF)",
    padding: "5px 20px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.32)",
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: "clamp(0.98rem, 3.3vw, 1.18rem)",
    textShadow: "0 0 8px rgba(0,0,0,0.7)",
    boxShadow: "0 0 18px rgba(255,23,68,0.62), 0 0 22px rgba(30,155,255,0.36)",
    zIndex: 6
  },
  overlay: { 
    position: "absolute", 
    inset: 0, 
    background:
      "radial-gradient(circle at 50% 38%, rgba(255,23,68,0.18), transparent 30%), radial-gradient(circle at 50% 62%, rgba(30,155,255,0.14), transparent 32%), rgba(0,0,0,0.88)",
    backdropFilter: "blur(2px)",
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    zIndex: 10 
  },
  readyOverlay: {
    background:
      "radial-gradient(circle at 50% 42%, rgba(255,23,68,0.14), transparent 34%), rgba(0,0,0,0.38)",
    backdropFilter: "none",
  },
  readyGroup: { 
    textAlign: "center", 
    transform: "translateY(-58px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "10px 18px",
    borderRadius: "18px",
    background: "rgba(0,0,0,0.38)",
    border: "1px solid rgba(255,255,255,0.22)",
  }, 
  readyLabel: { 
    color: "#FFFFFF",
    fontSize: "clamp(0.98rem, 4.2vw, 1.34rem)",
    fontWeight: "900",
    letterSpacing: "0",
    textShadow: "0 0 16px rgba(255,23,68,0.78), 0 0 18px rgba(30,155,255,0.4)",
  },
  countdownText: { 
    fontSize: "clamp(3.6rem, 18vw, 6rem)",
    fontWeight: "900", 
    color: "#FFFFFF",
    lineHeight: "1"
  },
  readyHint: {
    color: "#DCEBFF",
    fontSize: "clamp(0.74rem, 2.8vw, 0.88rem)",
    fontWeight: "700",
  },
  resultGroup: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    gap: "clamp(18px, 3.7dvh, 30px)",
    width: "100%" 
  },
  startLogo: {
    width: "clamp(160px, 48vw, 245px)",
    height: "clamp(160px, 48vw, 245px)",
    objectFit: "cover",
    borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.8)",
    boxShadow:
      "0 0 0 7px rgba(255,23,68,0.16), 0 18px 42px rgba(0,0,0,0.58), 0 0 38px rgba(255,23,68,0.42), 0 0 34px rgba(30,155,255,0.34)",
  },
  startTitle: {
    color: "#FFFFFF",
    fontSize: "clamp(1.08rem, 5vw, 1.55rem)",
    fontWeight: "900",
    lineHeight: 1,
    textShadow: "0 0 16px rgba(255,23,68,0.8), 0 0 18px rgba(30,155,255,0.55)",
  },
  resBox: { textAlign: "center" },
  finalSummary: {
    width: "min(84%, 330px)",
    maxHeight: "calc(100% - 24px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "clamp(7px, 1.7dvh, 12px)",
    overflowY: "auto",
    paddingBottom: "0",
    marginBottom: 0,
  },
  resLabel: {
    color: "#DCEBFF",
    fontSize: "clamp(0.95rem, 3.4vw, 1.15rem)",
    fontWeight: "900",
  },
  resTotal: {
    fontSize: "clamp(3.35rem, 15vw, 5.2rem)",
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: "0.92",
    margin: "10px 0",
    textShadow: "0 0 28px rgba(255,23,68,0.72), 0 0 24px rgba(30,155,255,0.5)",
  },
  resultSubtext: {
    color: "#DCEBFF",
    fontSize: "clamp(0.82rem, 3vw, 1rem)",
    fontWeight: "800",
    textShadow: "0 0 12px rgba(30,155,255,0.35)",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "8px 12px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(4,6,13,0.64))",
    boxShadow: "0 0 18px rgba(30,155,255,0.12)",
    animation: "scoreReveal 520ms ease-out both",
  },
  summaryLabel: {
    color: "#DCEBFF",
    fontSize: "clamp(0.82rem, 3vw, 1rem)",
    fontWeight: "900",
  },
  summaryValue: {
    fontSize: "clamp(1.9rem, 8vw, 2.8rem)",
    fontWeight: "900",
    lineHeight: 1,
    textShadow: "0 0 16px currentColor",
  },
  finalTotalBox: {
    marginTop: "clamp(6px, 1.5dvh, 12px)",
    textAlign: "center",
    animation: "scoreReveal 680ms ease-out both",
  },
  resultAwardImage: {
    width: "min(100%, 190px)",
    aspectRatio: "3 / 2",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.24)",
    margin: "clamp(12px, 2.4dvh, 18px) auto 6px",
    boxShadow: "0 0 22px rgba(255,23,68,0.28), 0 0 24px rgba(30,155,255,0.22)",
    display: "block",
  },
  resultAwardBaby: {
    objectPosition: "center",
  },
  awardTitle: {
    color: "#FFFFFF",
    fontSize: "clamp(0.92rem, 3.4vw, 1.08rem)",
    fontWeight: "900",
    lineHeight: 1.18,
    textShadow: "0 0 14px rgba(255,23,68,0.48), 0 0 12px rgba(30,155,255,0.36)",
  },
  awardMessage: {
    color: "#DCEBFF",
    fontSize: "clamp(0.78rem, 2.85vw, 0.92rem)",
    fontWeight: "800",
    lineHeight: 1.3,
    marginTop: "4px",
  },
  awardGold: {
    color: "#FFD84A",
    textShadow: "0 0 16px rgba(255,216,74,0.62)",
  },
  awardDiamond: {
    color: "#DFF3FF",
    textShadow: "0 0 16px rgba(30,155,255,0.76), 0 0 18px rgba(255,255,255,0.4)",
  },
  btnStart: { 
    minHeight: "52px",
    padding: "14px 40px",
    fontSize: "clamp(1.02rem, 4vw, 1.25rem)",
    fontWeight: "900",
    background: "linear-gradient(135deg, #FFFFFF, #FF1744 45%, #1E9BFF)",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "999px",
    color: "#FFFFFF",
    cursor: "pointer", 
    textShadow: "0 0 8px rgba(0,0,0,0.65)",
    boxShadow: "0 0 26px rgba(255,23,68,0.48), 0 0 22px rgba(30,155,255,0.34), inset 0 1px 0 rgba(255,255,255,0.5)"
  },
  btnAgain: { 
    minHeight: "52px",
    padding: "14px 40px",
    fontSize: "clamp(1.02rem, 4vw, 1.25rem)",
    fontWeight: "900",
    background: "rgba(4,6,13,0.62)",
    border: "2px solid #FF1744",
    borderRadius: "999px",
    color: "#FFFFFF",
    cursor: "pointer",
    boxShadow: "0 0 18px rgba(255,23,68,0.42), 0 0 16px rgba(30,155,255,0.28)",
  },
  finalPlayAgain: {
    minHeight: "30px",
    marginTop: "8px",
    padding: "5px 16px",
    fontSize: "clamp(0.66rem, 2.35vw, 0.78rem)",
    fontWeight: "900",
    background: "linear-gradient(135deg, #FFFFFF, #FF1744 45%, #1E9BFF)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "999px",
    color: "#FFFFFF",
    cursor: "pointer",
    textShadow: "0 0 8px rgba(0,0,0,0.65)",
    boxShadow: "0 0 22px rgba(255,23,68,0.48), 0 0 18px rgba(30,155,255,0.34)",
  },
  footerContainer: {
    width: "100%", 
    paddingTop: "clamp(10px, 2.1dvh, 18px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },
  footerPanel: {
    position: "relative",
    width: "100%",
    minHeight: "clamp(50px, 8dvh, 68px)",
    display: "flex",
    alignItems: "center",
    gap: "clamp(10px, 3vw, 16px)",
    padding: "11px clamp(16px, 4.2vw, 22px)",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,0.18)",
    background:
      "linear-gradient(135deg, rgba(255,23,68,0.13), rgba(5,8,18,0.58) 48%, rgba(30,155,255,0.12)), rgba(0,0,0,0.42)",
    boxShadow: "inset 0 0 18px rgba(255,255,255,0.04), 0 0 18px rgba(255,23,68,0.16), 0 0 18px rgba(30,155,255,0.12)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  footerCopy: {
    width: "100%",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  footerText: {
    color: "#FFFFFF",
    fontFamily: "'Segoe UI', 'Noto Sans Thai', Arial, sans-serif",
    fontSize: "clamp(0.86rem, 3.28vw, 1.02rem)",
    fontWeight: "800",
    lineHeight: 1.3,
    textWrap: "balance",
    textAlign: "center",
    textShadow: "0 0 12px rgba(255,23,68,0.44), 0 0 14px rgba(30,155,255,0.28)",
    animation: "footerSlideUp 2.8s ease-in-out both",
  },
};
