import { View, Image, Text, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { colors, fontWeight } from '@/config/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
}

const sizeDims: Record<
  AvatarSize,
  { container: number; text: number; icon: number; dot: number }
> = {
  sm: { container: 32, text: 12, icon: 16, dot: 10 },
  md: { container: 40, text: 14, icon: 20, dot: 12 },
  lg: { container: 56, text: 18, icon: 28, dot: 14 },
  xl: { container: 80, text: 24, icon: 36, dot: 16 },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ source, name, size = 'md', online }: AvatarProps) {
  const dims = sizeDims[size];
  const containerStyle = {
    width: dims.container,
    height: dims.container,
    borderRadius: dims.container / 2,
  };

  return (
    <View style={styles.wrapper}>
      {source ? (
        <Image source={{ uri: source }} style={containerStyle} />
      ) : name ? (
        <View style={[styles.placeholder, containerStyle, { backgroundColor: colors.primary[100] }]}>
          <Text style={[styles.initials, { fontSize: dims.text }]}>{getInitials(name)}</Text>
        </View>
      ) : (
        <View style={[styles.placeholder, containerStyle, { backgroundColor: colors.gray[200] }]}>
          <User size={dims.icon} color={colors.gray[500]} />
        </View>
      )}
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {
              width: dims.dot,
              height: dims.dot,
              borderRadius: dims.dot / 2,
              backgroundColor: online ? colors.success[500] : colors.gray[400],
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: fontWeight.semibold,
    color: colors.primary[700],
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
