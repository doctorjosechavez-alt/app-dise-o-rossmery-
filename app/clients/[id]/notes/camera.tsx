import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { persistMediaFile } from "@/services/fileStorage";
import { colors, radius, spacing, typography } from "@/theme";

export default function CameraScreen() {
  const { id, mode } = useLocalSearchParams<{
    id: string;
    mode: "foto" | "video";
  }>();
  const router = useRouter();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const needsMicPermission = mode === "video";
  const permissionsReady =
    cameraPermission?.granted && (!needsMicPermission || micPermission?.granted);

  if (!cameraPermission || (needsMicPermission && !micPermission)) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  if (!permissionsReady) {
    return (
      <ScreenContainer>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>
            Se necesita permiso de cámara{needsMicPermission ? " y micrófono" : ""}{" "}
            para {mode === "video" ? "grabar video" : "tomar fotos"}.
          </Text>
          <Button
            label="Dar permiso"
            onPress={async () => {
              await requestCameraPermission();
              if (needsMicPermission) await requestMicPermission();
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  const handleTakePicture = async () => {
    if (busy || !cameraRef.current) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo) return;
      const fileUri = await persistMediaFile(photo.uri, "jpg");
      router.replace({
        pathname: `/clients/${id}/notes/save` as never,
        params: { type: "foto", fileUri },
      });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleRecording = async () => {
    if (!cameraRef.current || busy) return;
    if (isRecording) {
      cameraRef.current.stopRecording();
      return;
    }
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync();
      setIsRecording(false);
      if (!video) return;
      setBusy(true);
      const fileUri = await persistMediaFile(video.uri, "mp4");
      router.replace({
        pathname: `/clients/${id}/notes/save` as never,
        params: { type: "video", fileUri },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.flex}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode={mode === "video" ? "video" : "picture"}
      />
      <View style={styles.controls}>
        <Pressable
          style={styles.flipButton}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
        >
          <Text style={styles.flipLabel}>Voltear</Text>
        </Pressable>

        {mode === "video" ? (
          <Pressable
            style={[styles.shutter, isRecording && styles.shutterRecording]}
            onPress={handleToggleRecording}
            disabled={busy}
          />
        ) : (
          <Pressable
            style={styles.shutter}
            onPress={handleTakePicture}
            disabled={busy}
          />
        )}

        <View style={styles.flipButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: spacing.xl,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
  },
  flipButton: {
    width: 72,
  },
  flipLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: "#fff",
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: "#fff",
    backgroundColor: colors.terracotta,
  },
  shutterRecording: {
    backgroundColor: "#9A3B34",
    borderRadius: radius.md,
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  permissionText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
  },
});
