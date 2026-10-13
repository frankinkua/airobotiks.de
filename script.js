document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('robot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;

    // Robot arm parameters
    const segments = 4;
    const segmentLength = 60;
    const totalLength = segments * segmentLength;

    // Arm state
    let joints = Array(segments + 1).fill().map(() => ({ x: 0, y: 0 }));
    let target = { x: 0, y: 0 };
    let base = { x: 0, y: 0 };

    // Interaction state
    let isHovering = false;
    let time = 0;

    function resize() {
        const container = canvas.parentElement;
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Base of the robot arm
        base.x = width / 2;
        base.y = height;

        // Initialize joints straight up
        for (let i = 0; i <= segments; i++) {
            joints[i] = { x: base.x, y: base.y - i * segmentLength };
        }

        // Default target
        if (!isHovering) {
            target.x = base.x;
            target.y = base.y - totalLength + 50;
        }
    }

    window.addEventListener('resize', resize);

    function updateTarget(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        target.x = clientX - rect.left;
        target.y = clientY - rect.top;
        isHovering = true;
    }

    canvas.addEventListener('mousemove', updateTarget);
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling while touching canvas
        updateTarget(e);
    }, { passive: false });

    canvas.addEventListener('mouseleave', () => {
        isHovering = false;
    });
    canvas.addEventListener('touchend', () => {
        isHovering = false;
    });

    // Distance utility
    function dist(p1, p2) {
        return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
    }

    // FABRIK algorithm (Forward And Backward Reaching Inverse Kinematics)
    function solveIK() {
        // Distance from base to target
        const d = dist(base, target);

        // If target is unreachable, stretch towards it
        if (d >= totalLength) {
            for (let i = 0; i < segments; i++) {
                const r = dist(target, joints[i]);
                const lambda = segmentLength / r;
                joints[i+1].x = (1 - lambda) * joints[i].x + lambda * target.x;
                joints[i+1].y = (1 - lambda) * joints[i].y + lambda * target.y;
            }
        } else {
            // Target is reachable
            // Keep base joint stored temporarily
            const b = { x: joints[0].x, y: joints[0].y };

            // Tolerance
            const tol = 0.1;
            let dif = dist(joints[segments], target);
            let iter = 0;
            const maxIter = 10;

            while (dif > tol && iter < maxIter) {
                // Forward reaching (from end effector to base)
                joints[segments].x = target.x;
                joints[segments].y = target.y;

                for (let i = segments - 1; i >= 0; i--) {
                    const r = dist(joints[i+1], joints[i]);
                    const lambda = segmentLength / r;
                    joints[i].x = (1 - lambda) * joints[i+1].x + lambda * joints[i].x;
                    joints[i].y = (1 - lambda) * joints[i+1].y + lambda * joints[i].y;
                }

                // Backward reaching (from base to end effector)
                joints[0].x = b.x;
                joints[0].y = b.y;

                for (let i = 0; i < segments; i++) {
                    const r = dist(joints[i+1], joints[i]);
                    const lambda = segmentLength / r;
                    joints[i+1].x = (1 - lambda) * joints[i].x + lambda * joints[i+1].x;
                    joints[i+1].y = (1 - lambda) * joints[i].y + lambda * joints[i+1].y;
                }

                dif = dist(joints[segments], target);
                iter++;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Background grid (optional subtle effect on canvas itself)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < width; i += 40) {
            ctx.moveTo(i, 0); ctx.lineTo(i, height);
        }
        for (let i = 0; i < height; i += 40) {
            ctx.moveTo(0, i); ctx.lineTo(width, i);
        }
        ctx.stroke();

        // Draw Base
        ctx.fillStyle = '#1e1e24';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(base.x, base.y, 30, Math.PI, 0); // Semi-circle base
        ctx.fill();
        ctx.stroke();

        // Draw Arm Segments
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(joints[0].x, joints[0].y);
        for (let i = 1; i <= segments; i++) {
            ctx.lineTo(joints[i].x, joints[i].y);
        }
        ctx.stroke();

        // Inner arm line for aesthetic
        ctx.strokeStyle = '#1e1e24';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(joints[0].x, joints[0].y);
        for (let i = 1; i <= segments; i++) {
            ctx.lineTo(joints[i].x, joints[i].y);
        }
        ctx.stroke();

        // Draw Joints
        for (let i = 0; i <= segments; i++) {
            ctx.fillStyle = i === segments ? '#39ff14' : '#00f3ff';
            ctx.beginPath();
            ctx.arc(joints[i].x, joints[i].y, i === segments ? 8 : 10, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(joints[i].x - 2, joints[i].y - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw target indicator if hovering
        if (isHovering) {
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(target.x, target.y, 15 + Math.sin(time * 0.1) * 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(target.x - 25, target.y);
            ctx.lineTo(target.x + 25, target.y);
            ctx.moveTo(target.x, target.y - 25);
            ctx.lineTo(target.x, target.y + 25);
            ctx.stroke();
        }
    }

    function animate() {
        time++;

        // Idle animation when not interacting
        if (!isHovering) {
            const idleRadius = 80;
            target.x = base.x + Math.sin(time * 0.02) * idleRadius;
            target.y = base.y - 200 + Math.cos(time * 0.03) * idleRadius * 0.5;
        }

        solveIK();
        draw();

        requestAnimationFrame(animate);
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();

    if (!prefersReducedMotion) {
        animate();
    } else {
        // Just draw once if reduced motion is on, and only update on hover
        solveIK();
        draw();

        // Setup minimal updating for reduced motion
        let framePending = false;
        const updateReduced = () => {
            if (!framePending) {
                framePending = true;
                requestAnimationFrame(() => {
                    solveIK();
                    draw();
                    framePending = false;
                });
            }
        };

        canvas.addEventListener('mousemove', updateReduced);
        canvas.addEventListener('touchmove', updateReduced);
        canvas.addEventListener('mouseleave', () => {
            isHovering = false;
            target.x = base.x;
            target.y = base.y - 200;
            updateReduced();
        });
    }
});
