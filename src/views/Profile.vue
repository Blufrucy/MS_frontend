<template>
  <div class="profile-page">
    <h1>个人中心</h1>
    <el-card>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          {{ userStore.userInfo?.username }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ userStore.userInfo?.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userStore.userInfo?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="手机">
          {{ userStore.userInfo?.phone || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
h1 {
  margin-bottom: 24px;
}
</style>
